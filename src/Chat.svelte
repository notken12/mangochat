<script>
  import Login from "./Login.svelte";
  import ChatMessage from "./ChatMessage.svelte";
  import Rooms from "./Rooms.svelte";
  import { onMount } from "svelte";
  import { username, user, roomId, nick } from "./user";
  import debounce from "lodash.debounce";
  import { pair } from "./user";

  import GUN from "gun";
  const db = GUN();

  let currentRoom;

  let newMessage;
  let messages = [];

  let scrollBottom;
  let lastScrollTop;
  let canAutoScroll = true;
  let unreadMessages = false;
  let nickVal;
  nick.subscribe((v) => (nickVal = v));
  // let pairVal;

  const key = "mangochat";
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
      currentRoom = id;
      if (id === null || id === undefined) return;
      db.get("chat_" + id)
        .map(match)
        .once(async (data, id) => {
          if (data) {
            // Key for end-to-end encryption

            var message = {
              // transform the data
              who: await db.user(data).get("alias"), // a user might lie who they are! So let the user system detect whose data it is.
              what: (await SEA.decrypt(data.what, key)) + "", // force decrypt as text.
              when: GUN.state.is(data, "what"), // get the internal timestamp for the what property.
              nick: (await SEA.decrypt(data.nick, key)) + "",
            };

            if (message.what) {
              messages = [...messages.slice(-100), message].sort(
                (a, b) => a.when - b.when
              );
              if (canAutoScroll) {
                autoScroll();
              } else {
                unreadMessages = true;
              }
            }
          }
        });
    });
  });

  async function sendMessage() {
    const secret = await SEA.encrypt(newMessage, key);
    const encNick = await SEA.encrypt(nickVal, key);
    // console.log(pubkey)
    const message = user.get("all").set({ what: secret, nick: encNick });
    const index = new Date().toISOString();
    db.get("chat_" + currentRoom)
      .get(index)
      .put(message);
    newMessage = "";
    canAutoScroll = true;
    autoScroll();
  }
</script>

<div class="container">
  {#if $username && $nick !== undefined}
    {#if currentRoom}
      <main on:scroll={debouncedWatchScroll}>
        {#each messages as message (message.when)}
          <ChatMessage {message} sender={$username} />
        {/each}

        <div class="dummy" bind:this={scrollBottom} />
      </main>

      <form on:submit|preventDefault={sendMessage}>
        <input
          type="text"
          placeholder="Type a message..."
          bind:value={newMessage}
          maxlength="100"
        />

        <button type="submit" disabled={!newMessage}>💥</button>
      </form>

      {#if !canAutoScroll}
        <div class="scroll-button">
          <button on:click={autoScroll} class:red={unreadMessages}>
            {#if unreadMessages}
              💬
            {/if}

            👇
          </button>
        </div>
      {/if}
    {:else}
      <Rooms />
    {/if}
  {:else}
    <main>
      <Login />
    </main>
  {/if}
</div>
