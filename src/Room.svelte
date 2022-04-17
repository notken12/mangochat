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
  let nicksVal;
  nicks.subscribe((v) => {
    nicksVal = v;
    text = getRoomName(room);
  });

  $: text = getRoomName(room);

  function connectToRoom() {
    roomId.set(room.id);
    currentRoom.set(room);
  }
</script>

<div class="room" on:click={connectToRoom}>
  <img
    src={`https://avatars.dicebear.com/api/initials/${text.split(", ")[0]}.svg`}
    alt="avatar"
  />
  <div>{text}</div>
</div>

<style>
  .room {
    color: white;
  }
</style>
