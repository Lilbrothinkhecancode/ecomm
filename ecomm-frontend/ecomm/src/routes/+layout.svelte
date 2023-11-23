<script>
    import "../app.css";
    import { goto } from '$app/navigation';

    function navigateToSignUp() {
    goto('/users/new');
    }
  </script>

<button on:click={navigateToSignUp}>Sign Up</button>

  <slot />