<script>
  import {
    username,
    user,
    nick,
    roomId,
    getRoomName,
    currentRoom,
  } from "./user";

  function signout() {
    user.leave();
    location.reload();
  }

  function exitRoom() {
    roomId.set(null);
  }
</script>

<header>
  {#if $username && $roomId}
    <button on:click={exitRoom}>&lt;- Back</button>
  {:else}
    <h3>MangoChat</h3>
  {/if}
  {#if $username}
    {#if $roomId}
      <h1>{getRoomName($currentRoom)}</h1>
    {:else if $nick}
      <div class="user-bio">
        <span>Hello <strong>{$nick}</strong></span>
        <img
          src={`https://avatars.dicebear.com/api/initials/${$nick}.svg`}
          alt="avatar"
          width="36px"
          height="36px"
        />
      </div>
    {/if}
    <button class="signout-button" on:click={signout}>Sign Out</button>
  {:else}
    <h3>Gun.js Chat</h3>
  {/if}
</header>
