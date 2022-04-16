<script>
  import { username, user, nick } from './user';

  function signout() {
    user.leave();
  }
</script>

<header>
<h1>🔫💬</h1>
  {#if $username}
    <div class="user-bio">
      
      <span>Hello <strong>{$nick}</strong></span>
      <img src={`https://avatars.dicebear.com/api/initials/${$username}.svg`} alt="avatar" /> 
    </div>

    <button class="signout-button" on:click={signout}>Sign Out</button>

    {:else}

      <h3>Gun.js Chat</h3>
  {/if}
</header>