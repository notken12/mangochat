<!--
  ChatMessage.svelte

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
  import { parseSendDesoMsg, username, nicks, getNick } from "./user";

  export let message;
  export let sender;

  let usernameVal;
  username.subscribe((v) => (usernameVal = v));

  let transfer = parseSendDesoMsg(message.what);
  let nicksVal;
  nicks.subscribe((v) => {
    nicksVal = v;
    transferRecipient = getTransferRecipient();
    transferSender = getTransferSender();
  });

  function getClass() {
    let result = message.who === sender ? "sent" : "received";
    if (parseSendDesoMsg(message.what)) result += " transfer";
    return result;
  }

  const isTransfer = parseSendDesoMsg(message.what) !== false;

  const messageClass = getClass();

  const avatar = `https://avatars.dicebear.com/api/initials/${message.nick}.svg`;

  const ts = new Date(message.when);

  function getTransferTitle() {
    if (!isTransfer) return;

    return "$DESO Transfer";

    if (message.who === sender) {
      // You sent
      return "You sent $DESO!";
    } else {
      // You received
      return "You received $DESO!";
    }
  }

  function getTransferRecipient() {
    if (!transfer) return;
    if (transfer.recipient === usernameVal) return "You";
    if (nicksVal[transfer.recipient] === null) return transfer.recipient;
    if (nicksVal[transfer.recipient] === undefined) {
      getNick(transfer.recipient);
      return transfer.recipient;
    }
    return nicksVal[transfer.recipient];
  }

  function getTransferSender() {
    if (!transfer) return;
    if (message.who === usernameVal) return "You";
    if (nicksVal[message.who] === null) return message.who;
    if (nicksVal[message.who] === undefined) {
      getNick(message.who);
      return message.who;
    }
    return nicksVal[message.who];
  }

  let transferTitle = getTransferTitle();
  $: transferSender = getTransferSender();
  $: transferRecipient = getTransferRecipient();
</script>

<div class={`message ${messageClass}`}>
  <img src={avatar} alt="avatar" />
  <div class="message-text">
    {#if !isTransfer}
      <p>{message.what}</p>
    {:else}
      <div class="msg-body">
        <h3>{transferTitle}</h3>
        <p>
          <span>{transferSender}</span>
          <span> =&gt; </span>
          <span>{transferRecipient}</span>
        </p>
        <p>
          {transfer.amountDeso} $DESO (${transfer.amountUsd} USD)
        </p>
      </div>
    {/if}

    <time>{ts.toLocaleTimeString()} from {message.nick}</time>
  </div>
</div>
