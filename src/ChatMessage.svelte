


<script>
  import { username, user, nick } from './user';
  export let message;
  export let sender;

  const messageClass = message.who === sender ? 'sent' : 'received';

  const avatar = `https://avatars.dicebear.com/api/initials/${message.who}.svg`;

  const ts = new Date(message.when);
  
</script>

<div class={`message ${messageClass}`}>
  <img src={avatar} alt="avatar" />
  <div class="message-text">
    <p>{message.what}</p>

    <time>{ts.toLocaleTimeString()} by{$nick}</time>
  </div>

</div>
