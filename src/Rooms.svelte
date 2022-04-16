<script>
  import Room from "./Room.svelte";
  import { onMount } from "svelte";
  import { username, user } from "./user";

  import GUN from "gun";
  const db = GUN();

  let rooms = [];
  let makingNewRoom = false;
  let newRoomName = "";
  let addMemberId = "";
  let newRoomMembers = [];
  let hint = "";

  const key = "mangochat";
  onMount(() => {
    // Get rooms
    user
      .get("arooms")
      .map()
      .once(async (data, id) => {
        if (!data) return;
        console.log(data);
        // Transform data
        var room = {
          id: (await SEA.decrypt(data.id, key)) + "",
          members: await SEA.decrypt(data.members, key),
        };
        // var room = {
        //   id: data.id,
        //   members: JSON.parse(data.members),
        // };
        console.log(room);

        rooms[rooms.length] = room;
      });
  });

  async function sendMessage() {
    const secret = await SEA.encrypt(newMessage, key);
    const message = user.get("all").set({ what: secret });
    const index = new Date().toISOString();
    db.get("mangochat").get(index).put(message);
    newMessage = "";
    canAutoScroll = true;
    autoScroll();
  }

  async function createRoom() {
    const members = newRoomMembers;
    const roomName = Math.random().toString();

    const encId = await SEA.encrypt(roomName, key);
    // const encId = newRoomName;
    const encMembers = await SEA.encrypt(JSON.stringify(members), key);
    // const encMembers = JSON.stringify(members);
    const index = new Date().toISOString();
    const room = user.get("all").set({ id: encId, members: encMembers });
    user.get("arooms").get(index).put(room);
    makingNewRoom = false;
  }

  async function checkMemberValid() {
    // Get their pubkey
    let pubkey = await db.get("pubkeys").get(addMemberId);
    if (pubkey) return true;
    return false;
  }

  function makeNewRoom() {
    makingNewRoom = true;
  }

  async function addMember() {
    if (await checkMemberValid()) {
      newRoomMembers[newRoomMembers.length] = addMemberId;
    } else {
      hint = "User doesn't exist";
    }
  }
</script>

<div class="rooms-container">
  {#if makingNewRoom}
    <input
      bind:value={addMemberId}
      type="text"
      placeholder="Add someone by wallet address"
      on:submit={addMember}
      on:change={() => (hint = "")}
    />
    <button on:click={addMember}>Add member</button>
    <div>{hint}</div>
    <button on:click={createRoom}>Create room</button>
  {:else}
    <button on:click={makeNewRoom}>Create room</button>
  {/if}
  {#each rooms as room}
    <Room {room} />
  {/each}
</div>
