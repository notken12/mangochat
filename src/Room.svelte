<!--
  Room.svelte

  MIT License

  Copyright (c) 2022 Ken Zhou, Ray Shen, Eli Osei-Tutu, Viraj

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
-->

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
