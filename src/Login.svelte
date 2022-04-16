<script>
  import { user } from "./user";
  import Deso from "deso-protocol";
  const deso = new Deso();

  let name;
  let pwd;

  function login() {
    user.auth(name, pwd, ({ err }) => err && alert(err));
  }

  async function promptLogin() {
    const response = await deso.identity.login();
    console.log(response);
    let { ethDepositAddress } = response.user;
    name = ethDepositAddress;
    let { key } = response;
    pwd = key;
    console.log(key);
    console.log(pwd);
    user.auth(name, pwd, ({ err }) => {
      if (err) {
        console.log(err);
        user.create(name, pwd, ({ err }) => {
          if (err) {
            alert(err);
          } else {
            login();
          }
        });
      }
    });
  }
</script>

<label for="username">Username</label>
<input name="username" bind:value={nick} minlength="3" maxlength="16" />

<h1>Hello {nick}</h1>

<button class="login" on:click={promptLogin}>Login</button>

