<script>
  import { user, nick } from "./user";
  import Deso from "deso-protocol";
  const deso = new Deso();
  import GUN from "gun";
  const db = GUN();

  let wallet;
  let pwd;
  let settingNick = false;
  let nickToSet = "";

  let nickVal;
  nick.subscribe((n) => {
    nickVal = n;
  });

  if (!nickVal) {
    settingNick = true;
  }

  function login(cb) {
    user.auth(wallet, pwd, ({ err }) => {
      if (!err) {
        cb();
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
            login(() => {
              if (nickVal === undefined) {
                settingNick = true;
              }
            });
          }
        });
      } else {
        if (nickVal === undefined) {
          settingNick = true;
        }
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

    // var auser = db.user(wallet).put({nick: nick});
    // db.get('users').set(auser, (result) => {
    //   console.log(result)
    // });
    user.get("nick").put(nickToSet, console.log);
    nick.set(nickToSet);
  }
</script>

<!-- <h1>Hello {$nick || $username}</h1> -->

{#if settingNick}
  <label for="username">Nickname</label>
  <input name="username" bind:value={nickToSet} minlength="3" maxlength="16" />
  <button on:click={setNick}>Set nickname</button>
{:else}
  <button class="login" on:click={promptLogin}>Login</button>
{/if}
