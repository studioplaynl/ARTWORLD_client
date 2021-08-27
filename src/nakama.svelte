<script context="module">
  import { Client } from "@heroiclabs/nakama-js";
  
  //	export const client = new Client("WeEatChildrenForBreakfast", "192.168.0.133", "7350");
  //export const client = new Client("WeEatChildrenForBreakfast", "192.168.0.121", "7350");
  export const SSL = true;

  export const client = new Client(
    "WeEatChildrenForBreakfast",
    "nakama.toekomst.school",
    "",
    SSL
  );
</script>
