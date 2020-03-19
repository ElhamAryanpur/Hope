<script>
    import Box from './box.svelte';

    export let id;
    if (id == undefined){ id = "dialog" }

    export let title;
    if (title == undefined){ title = "" }

    export let button;
    if (button == undefined){ button = false }

    export let style;
    if (style == undefined){ style = "" }



    import { onMount } from 'svelte';

    onMount(() => {
        if (button == false){ jQuery("#" + id).dialog({ width:'auto' }); }
        else { jQuery("#" + id).dialog({
            autoOpen: false,
            width:'auto',
            maxHeight: window.HEIGHT - 100
        }); }
    });
</script>

<style>
    button{
        padding: 20px;
        background: #1a2835;
        border-radius: 10px;
        text-align: center;
        cursor: pointer;
        font-weight: bold;
        color: #6AAAC9;
        border: 1px solid #6AAAC9;
        margin: 10px;
    }
</style>

<div id="{id}" title="{title}">
    <slot></slot>
</div>

{#if button != false}
    <button class="box" onclick="jQuery(`#{id}`).dialog('open');" style="{style}">{button}</button>
{/if}