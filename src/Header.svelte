<!--
  Header.svelte

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
    <h3>🥭 MangoChat</h3>
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
