<!--
  Chat.svelte

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
  import Login from "./Login.svelte";
  import ChatMessage from "./ChatMessage.svelte";
  import Rooms from "./Rooms.svelte";
  import { onMount } from "svelte";
  import {
    username,
    user,
    roomId,
    nick,
    pair,
    getSendDesoMsg,
    nicks,
  } from "./user";
  import debounce from "lodash.debounce";
  import { deso } from "./deso";

  import GUN from "gun";
  const db = GUN();

  let currentRoomId;
  let currentRoom;

  let newMessage;
  let messages = [];

  let scrollBottom;
  let lastScrollTop;
  let canAutoScroll = true;
  let unreadMessages = false;
  let nickVal;

  nick.subscribe((v) => {
    nickVal = v;
    console.log(nickVal);
  });
  // let pairVal;
  let nicksVal;

  nicks.subscribe((v) => {
    nicksVal = v;
    console.log(nicksVal);
  });

  let usernameVal;
  username.subscribe((v) => (usernameVal = v));

  let pairVal;
  pair.subscribe((v) => (pairVal = v));

  const unsafeKey = "mangochat";
  // pair.subscribe(v => pairVal = v)

  function autoScroll() {
    setTimeout(() => scrollBottom?.scrollIntoView({ behavior: "auto" }), 50);
    unreadMessages = false;
  }

  function watchScroll(e) {
    canAutoScroll = (e.target.scrollTop || Infinity) > lastScrollTop;
    lastScrollTop = e.target.scrollTop;
  }

  $: debouncedWatchScroll = debounce(watchScroll, 1000);

  onMount(() => {
    var match = {
      // lexical queries are kind of like a limited RegEx or Glob.
      ".": {
        // property selector
        ">": new Date(+new Date() - 1 * 1000 * 60 * 60 * 3).toISOString(), // find any indexed property larger ~3 hours ago
      },
      "-": 1, // filter in reverse
    };

    roomId.subscribe((id) => {
      // Get Messages
      messages = [];
      currentRoomId = id;
      if (id === null || id === undefined) return;
      // console.log("my username is", usernameVal);
      db.get("chat_" + id)
        .get("messages")
        .get(usernameVal)
        .map()
        .once(async (data, id) => {
          if (data) {
            let member = await db.user(data).get("alias");
            // Key for end-to-end encryption
            db.get("pubkeys")
              .get(member)
              .once(async (userPair, id) => {
                let key = await SEA.secret(userPair.epub, pairVal);
                // console.log("my key is", key);
                // console.log("my username is", usernameVal);
                // console.log("received msg");

                var message = {
                  // transform the data
                  who: member, // a user might lie who they are! So let the user system detect whose data it is.
                  what: (await SEA.decrypt(data.what, key)) + "", // force decrypt as text.
                  when: GUN.state.is(data, "what"), // get the internal timestamp for the what property.
                  nick: (await SEA.decrypt(data.nick, key)) + "",
                };

                if (message.what) {
                  messages = [...messages.slice(-100), message].sort(
                    (a, b) => a.when - b.when
                  );
                }
                if (canAutoScroll) {
                  autoScroll();
                } else {
                  unreadMessages = true;
                }
              });
          }
        });

      user
        .get("adrooms")
        .map()
        .once(async (data, id) => {
          var room = {
            id: (await SEA.decrypt(data.id, unsafeKey)) + "",
            members: await SEA.decrypt(data.members, unsafeKey),
          };
          currentRoom = room;
        });
    });
  });

  async function sendMessage() {
    const index = new Date().toISOString();
    let cachedMsg = newMessage + "";
    for (let member of currentRoom.members) {
      // member stands for the members id
      db.get("pubkeys")
        .get(member)
        .once(async (data, id) => {
          let key = await SEA.secret(data.epub, pairVal);
          console.log(`key of member ${member} is `, key);
          console.log(currentRoomId);
          const secret = await SEA.encrypt(cachedMsg, key);
          const encNick = await SEA.encrypt(nickVal, key);
          const message = user.get("all").set({ what: secret, nick: encNick });

          db.get("chat_" + currentRoomId)
            .get("messages")
            .get(member)
            .get(index)
            .put(message);
        });
    }

    newMessage = "";
    canAutoScroll = true;
    autoScroll();
  }

  async function sendDeso() {
    const index = new Date().toISOString();
    let cachedUsd = transferAmountUsd + 0;
    let cachedDeso = transferAmountDeso + 0;
    let cachedRecipient = recipient + "";

    for (let member of currentRoom.members) {
      // member stands for the members id
      db.get("pubkeys")
        .get(member)
        .once(async (data, id) => {
          let key = await SEA.secret(data.epub, pairVal);
          console.log(`key of member ${member} is `, key);
          console.log(currentRoomId);
          let desoMsg = getSendDesoMsg(cachedRecipient, cachedDeso, cachedUsd);
          const secret = await SEA.encrypt(desoMsg, key);
          const encNick = await SEA.encrypt(nickVal, key);
          const message = user.get("all").set({ what: secret, nick: encNick });

          db.get("chat_" + currentRoomId)
            .get("messages")
            .get(member)
            .get(index)
            .put(message);
        });
    }

    transferAmountUsd = 0;
    transferAmountDeso = 0;
    recipient = null;
    sendingDeso = false;
    canAutoScroll = true;
    autoScroll();
  }

  let transferAmountDeso = 0;
  let transferAmountUsd = 0;
  let sendingDeso = false;
  let exchangeRate;
  let recipient = null;

  async function getExchangeRate() {
    const response = await deso.metaData.getExchangeRate();
    // console.log("exchange rates", response);
    exchangeRate = response.USDCentsPerDeSoExchangeRate;
  }
  getExchangeRate();
  async function updateConversionDeso() {
    if (!exchangeRate) {
      await getExchangeRate();
      updateConversionDeso();
      return;
    }
    transferAmountUsd = (transferAmountDeso * exchangeRate) / 100;
  }
  async function updateConversionUsd() {
    if (!exchangeRate) {
      await getExchangeRate();
      updateConversionUsd();
      return;
    }
    transferAmountDeso = (transferAmountUsd / exchangeRate) * 100;
  }

  window.deso = deso;
</script>

<div class="container">
  {#if $username && $nick !== undefined}
    {#if currentRoomId}
      <main on:scroll={debouncedWatchScroll}>
        {#each messages as message (message.when)}
          <ChatMessage {message} sender={$username} />
        {/each}

        <div class="dummy" bind:this={scrollBottom} />
      </main>
      <div class="bottom">
        {#if !sendingDeso}
          <form on:submit|preventDefault={sendMessage}>
            <button on:click={() => (sendingDeso = true)} type="button"
              >Send $DESO</button
            >

            <input
              type="text"
              placeholder="Type a message..."
              bind:value={newMessage}
              maxlength="500"
            />

            <button type="submit" disabled={!newMessage}>Send</button>
          </form>
        {:else}
          <div class="recipients">
            <h4>Transfer to...</h4>
            {#each currentRoom.members as member}
              {#if member !== $username}
                <div
                  on:click={() => {
                    recipient = member;
                  }}
                  class="recipient"
                  class:selected={recipient === member}
                >
                  {$nicks[member] || member}
                </div>
              {/if}
            {/each}
          </div>
          <form on:submit|preventDefault={sendDeso}>
            <button on:click={() => (sendingDeso = false)} type="button"
              >Cancel</button
            >
            <div>$DESO:</div>
            <input
              type="number"
              placeholder="Amount"
              bind:value={transferAmountDeso}
              maxlength="100"
              on:input={updateConversionDeso}
              step="any"
            />
            <div>=$USD</div>
            <input
              type="number"
              placeholder="Amount"
              bind:value={transferAmountUsd}
              maxlength="100"
              on:input={updateConversionUsd}
              step="any"
            />
            <button type="submit" disabled={!transferAmountDeso || !recipient}
              >Send</button
            >
          </form>
        {/if}
      </div>

      <!-- {#if !canAutoScroll} -->
      <!--   <div class="scroll-button"> -->
      <!--     <button on:click={autoScroll} class:red={unreadMessages}> -->
      <!--       {#if unreadMessages} -->
      <!--         💬 -->
      <!--       {/if} -->
      <!---->
      <!--       👇 -->
      <!--     </button> -->
      <!--   </div> -->
      <!-- {/if} -->
    {:else}
      <Rooms />
    {/if}
  {:else}
    <main>
      <Login />
    </main>
  {/if}
</div>
