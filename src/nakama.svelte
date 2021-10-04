<script context="module">
  import { Client } from "@heroiclabs/nakama-js";

  //	export const client = new Client("WeEatChildrenForBreakfast", "192.168.0.133", "7350");
    export const SSL = false;

    export const client = new Client("WeEatChildrenForBreakfast", "192.168.0.138", "7350", SSL);
 
    /*
  export const client = new Client(
    "WeEatChildrenForBreakfast",
    "nakama.toekomst.school",
    "",
    SSL
  );
  */
</script>
