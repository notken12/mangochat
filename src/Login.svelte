<script>
  import { user } from "./user";
  import Deso from "deso-protocol";
  const deso = new Deso();

  let username;
  let password;

  let name;
  let pwd;

  function login() {
    user.auth(name, pwd, ({ err }) => err && alert(err));
  }

  async function promptLogin() {
    const response = await deso.identity.login(4);
    console.log(response);
    let { ethDepositAddress } = response.user;
    name = ethDepositAddress;
    let { encryptedSeedHex } = response.user;
    pwd = encryptedSeedHex;
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
<input name="username" bind:value={username} minlength="3" maxlength="16" />

<label for="password">Password</label>
<input name="password" bind:value={password} type="password" />

<button class="login" on:click={promptLogin}>Login</button>
<!-- <button class="login" on:click={signup}>Sign Up</button> -->
