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

  const avatar = `https://avatars.dicebear.com/api/initials/${message.who}.svg`;

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
