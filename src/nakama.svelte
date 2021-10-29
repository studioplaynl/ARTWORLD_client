<script context="module">
  import { Client } from "@heroiclabs/nakama-js";

  //	export const client = new Client("RHSGvCuxJRmEf347", "192.168.0.133", "7350");
  // export const SSL = false;

  // export const client = new Client("RHSGvCuxJRmEf347", "192.168.0.138", "7350", SSL);

  export const SSL = true;

  export const client = new Client(
    "RHSGvCuxJRmEf347",
    "nakama.toekomst.school",
    "",
    SSL
  );
</script>
