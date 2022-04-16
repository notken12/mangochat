<script>
  import { roomId } from "./user.js";
  export let room;

  function connectToRoom() {
    roomId.set(room.id);
  }
</script>

<div class="room" on:click={connectToRoom}>
  {room.id}
</div>

<style>
  .room {
    color: white;
  }
</style>
