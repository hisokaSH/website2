import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  global_name?: string;
}

interface DiscordGuild {
  id: string;
  name: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { discordAccessToken, guildId } = await req.json();

    if (!discordAccessToken || !guildId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const discordUserResponse = await fetch('https://discord.com/api/v10/users/@me', {
      headers: {
        Authorization: `Bearer ${discordAccessToken}`,
      },
    });

    if (!discordUserResponse.ok) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch Discord user' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const discordUser: DiscordUser = await discordUserResponse.json();

    const discordGuildsResponse = await fetch('https://discord.com/api/v10/users/@me/guilds', {
      headers: {
        Authorization: `Bearer ${discordAccessToken}`,
      },
    });

    if (!discordGuildsResponse.ok) {
      const errorText = await discordGuildsResponse.text();
      console.error('Discord guilds fetch failed:', discordGuildsResponse.status, errorText);
      return new Response(
        JSON.stringify({
          error: 'Failed to fetch Discord guilds',
          details: `Status: ${discordGuildsResponse.status}`,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const guilds: DiscordGuild[] = await discordGuildsResponse.json();
    const isMember = guilds.some(guild => guild.id === guildId);

    const discordUsername = discordUser.global_name || 
                           `${discordUser.username}#${discordUser.discriminator}`;

    const { error: updateError } = await supabase
      .from('users')
      .update({
        discord_id: discordUser.id,
        discord_username: discordUsername,
        discord_verified: isMember,
      })
      .eq('id', user.id);

    if (updateError) {
      return new Response(
        JSON.stringify({ error: 'Failed to update user' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        verified: isMember,
        username: discordUsername,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});