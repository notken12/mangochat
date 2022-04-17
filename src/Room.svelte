<script>
  import { roomId, username, getNick, nicks } from "./user.js";
  export let room;
  let usernameVal;
  username.subscribe((v) => (usernameVal = v));

  let nicksVal;
  nicks.subscribe((v) => (nicksVal = v));
  window.nicks = nicksVal;

  $: text = (() => {
    if (room.members) {
      let s = "";
      for (let i = 0; i < room.members.length; i++) {
        let mem = room.members[i];
        // Don't list yourself
        if (mem == usernameVal) continue;
        if (i !== 0 && s !== "") {
          s += ", ";
        }
        let memNick = nicksVal[mem];
        s += memNick || mem;
        if (mem === undefined) {
          getNick(mem);
        }
      }
      return s;
    }
  })();

  function connectToRoom() {
    roomId.set(room.id);
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
