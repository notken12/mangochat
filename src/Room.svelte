<script>
  import {
    roomId,
    username,
    getNick,
    nicks,
    getRoomName,
    currentRoom,
  } from "./user.js";
  export let room;
  let usernameVal;
  username.subscribe((v) => (usernameVal = v));

  $: text = (() => {
    return getRoomName(room);
  })();

  function connectToRoom() {
    roomId.set(room.id);
    currentRoom.set(room);
  }
</script>

<div class="room" on:click={connectToRoom}>
  {text}
</div>

<style>
  .room {
    color: white;
  }
</style>
