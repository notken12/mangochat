<script>
  import { username, user, nick, roomId } from "./user";

  function signout() {
    user.leave();
    location.reload();
  }
</script>

<header>
  <h1>🔫💬</h1>
  {#if $username}
    <h1>{$roomId}</h1>
    <div class="user-bio">
      <span>Hello <strong>{$nick}</strong></span>
      <img
        src={`https://avatars.dicebear.com/api/initials/${$nick}.svg`}
        alt="avatar"
      />
    </div>

    <button class="signout-button" on:click={signout}>Sign Out</button>
  {:else}
    <h3>Gun.js Chat</h3>
  {/if}
</header>

