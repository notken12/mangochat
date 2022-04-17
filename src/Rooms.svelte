<script>
  import Room from "./Room.svelte";
  import { onMount } from "svelte";
  import { username, user, generateUUID } from "./user";

  import GUN from "gun";
  const db = GUN();
  window.db = db;

  let rooms = [];
  let makingNewRoom = false;
  let newRoomName = "";
  let addMemberId = "";
  let newRoomMembers = [];
  let hint = "";

  let usernameVal;
  username.subscribe((v) => (usernameVal = v));

  let already = {};

  const key = "mangochat";
  onMount(() => {
    // Get saved rooms
    user
      .get("adrooms")
      .map()
      .once(async (data, id) => {
        console.log(data);
        if (!data) return;
        // Transform data
        var room = {
          id: (await SEA.decrypt(data.id, key)) + "",
          members: await SEA.decrypt(data.members, key),
        };
        if (!room.members) return;

        rooms[rooms.length] = room;
      });
    // Get rooms from pending room invites
    db.get("roominvites")
      .get(usernameVal)
      .map()
      .once(async (data, id) => {
        if (already[id]) return;
        console.log(data, id);
        already[id] = true;
        if (!data) return;
        // Transform data
        var room = {
          id: (await SEA.decrypt(data.id, key)) + "",
          members: await SEA.decrypt(data.members, key),
        };

        if (!room.members) return;
        // Add to user's saved rooms
        user.get("adrooms").get(room.id).put(data);
        // Delete the room invite
        db.get("roominvites").get(usernameVal).put(null);
      });
  });

  function removeDuplicates(array) {
    return [...new Set(array)];
  }

  async function createRoom() {
    let members = newRoomMembers;
    // Add yourself
    members.push(usernameVal);
    // Remove duplicates
    members = removeDuplicates(members);
    if (members.length <= 1) {
      hint = "Add some people first!";
      return;
    }
    const roomName = generateUUID();

    const encId = await SEA.encrypt(roomName, key);
    // const encId = newRoomName;
    const encMembers = await SEA.encrypt(JSON.stringify(members), key);
    // const encMembers = JSON.stringify(members);
    const index = new Date().toISOString();
    const data = { id: encId, members: encMembers };
    const room = user.get("all").set(data);
    user.get("adrooms").get(index).put(room);
    for (let member of members) {
      // Add record under each invited members invites
      // Don't add room invite to yourself
      if (member !== usernameVal)
        db.get("roominvites").get(member).get(encId).put(data);
    }
    makingNewRoom = false;
  }

  function checkMemberValid() {
    // Get their pubkey
    return new Promise((resolve, reject) => {
      console.log("get", addMemberId);
      db.get("pubkeys")
        .get(addMemberId)
        .once((data, id) => {
          console.log(data);
          if (!data) resolve(false);
          else resolve(true);
        });
    });
  }

  function makeNewRoom() {
    makingNewRoom = true;
  }

  async function addMember() {
    if (addMemberId === usernameVal) {
      hint = "No need to add yourself!";
      return;
    }
    if (await checkMemberValid()) {
      newRoomMembers[newRoomMembers.length] = addMemberId;
      newRoomMembers = removeDuplicates(newRoomMembers);
    } else {
      hint = "User doesn't exist";
    }
  }

  function handleEnter(e) {
    if (e.key === "Enter") {
      addMember();
    }
  }

  let copied = false;

  function copyUsername() {
    /* Get the text field */
    var copyText = document.createElement("input");

    /* Select the text field */
    copyText.value = usernameVal;
    copyText.select();
    copyText.setSelectionRange(0, 99999); /* For mobile devices */

    /* Copy the text inside the text field */
    navigator.clipboard.writeText(copyText.value);

    copied = true;
  }
</script>

<div class="rooms-container">
  <h2 color='#153a29'>Your wallet address:</h2>
  <h3>{$username}</h3>
  <button on:click={copyUsername}>Copy</button>
  {#if copied}
    <div>Copied!</div>{/if}
  <br />
  {#if makingNewRoom}
    <input
      bind:value={addMemberId}
      type="text"
      placeholder="Add someone by wallet address"
      on:submit={addMember}
      on:input={() => (hint = "")}
      on:keyup={handleEnter}
    />
    <button on:click={addMember}>Add member</button>
    <div>{hint}</div>
    <h2>Members</h2>
    <ol>
      {#each newRoomMembers as member}
        <li>{member}</li>
      {/each}
      {#if newRoomMembers.length === 0}
        <h3>Add some people!</h3>{/if}
    </ol>
    <button on:click={createRoom}>Create room</button>
  {:else}
    <br />
    <button on:click={makeNewRoom}>Create room</button>
  {/if}
  <h3>Your rooms</h3>
  {#each rooms as room}
    <Room {room} />
  {/each}
</div>
