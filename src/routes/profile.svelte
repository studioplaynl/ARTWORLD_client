<script>
  import { Session } from "../session.js";
  import { client } from "../nakama.svelte";
  console.log($Session);
  let user = "",
    role = "",
    avatar_url = "",
    azs = "";

  async function getAccount() {
    const account = await client.getAccount($Session);
    user = account.user.username;
    console.info(account.user.username);
    let meta = JSON.parse(account.user.metadata);
    role = meta.role;
    azs = meta.azs || null;
    let url = account.user.avatar_url
    getAvatar(url).then((url) => avatar_url = url)
    console.info(account.user);
  }

  let promise = getAccount();

  async function getAvatar(avatar_url) {
      const payload = {"url": avatar_url};
        const rpcid = "download_file";
        const fileurl = await client.rpc($Session, rpcid, payload);
        let url = fileurl.payload.url
        console.log(url)
        return url
    }

</script>

<main>
  <div class="flex-container">
    <div class="flex-item-left">
      <img id="avatar" src={avatar_url} /><br />
      <a href="/#/uploadAvatar/">Create</a>
      <p>username: {user}</p>
      <p>role: {role}</p>
      <p>locatie: {azs}</p>
      <a href="/#/">edit</a>
    </div>
    <div class="flex-item-right">
      <h1>Mijn kunstwerken</h1>
    </div>
  </div>
</main>

<style>
  .flex-container {
    display: flex;
    flex-direction: row;
    font-size: 30px;
    text-align: center;
  }

  .flex-item-left {
    background-color: #f1f1f1;
    padding: 10px;
    flex: 30%;
  }

  .flex-item-right {
    background-color: dodgerblue;
    padding: 10px;
    flex: 70%;
  }

  /* Responsive layout - makes a one column-layout instead of two-column layout */
  @media (max-width: 800px) {
    .flex-container {
      flex-direction: column;
    }
  }

  #avatar {
    width: 50%;
    max-width: 250px;
  }
</style>
