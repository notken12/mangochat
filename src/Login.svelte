<script>
  import { user, nick } from "./user";
  import Deso from "deso-protocol";
  const deso = new Deso();
  import GUN from "gun";
  const db = GUN();

  let wallet;
  let pwd;


  function login(cb) {
    user.auth(wallet, pwd, ({ err }) => {
      if (!err) {
        cb()
      }
    });
  }

  async function promptLogin() {
    const response = await deso.identity.login(4);
    console.log(response);
    let { ethDepositAddress } = response.user;
    wallet = ethDepositAddress;
    let { encryptedSeedHex } = response.user;
    pwd = encryptedSeedHex;
    console.log(wallet);
    user.auth(wallet, pwd, ({ err }) => {
      if (err) {
        console.log(err);
        user.create(wallet, pwd, ({ err }) => {
          if (err) {
            alert(err);
          } else {
            login();
          }
        });
      }
    });
  }

  function setNick() {
    // db.user(name).set("nick", , (result) => {
    //   let {err} = result
      
    //   console.log(result)
    //   if (!err) {
    //     // TODO: show UI let the user click on a chat room
    //   }
    // })

    var auser = db.user(wallet).put({nick: nick});
    db.get('users').set(auser, (result) => {  
      console.log(result)
    });
  }
</script>


<h1>Hello {$nick}</h1>

<button class="login" on:click={promptLogin}>Login</button>


<label for="username">Nickname</label>
<input name="username" bind:value={$nick} minlength="3" maxlength="16" /> 
