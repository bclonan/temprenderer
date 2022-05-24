<template>
    <ThePageContainer :pageHeading="dto.screenTitle">
        <!-- @@TODO : Enter your code here -->
    </ThePageContainer>
</template>

<script lang="ts">
import { Vue } from "vue-property-decorator";
import { Component } from "vue-class-component";
import { SSR11234DTO } from "@/dto/SSR11234/SSR11234DTO";
import { SSR11234Data } from "@/data/SSR11234/SSR11234Data";

@Component({
})
export default class SSR11234 extends Vue {
    public dto = new SSR11234DTO();
    public data = new SSR11234Data();

//    beforeDestroy() {
//        this.dto = null;
//        delete this.dto;
//        this.data = null;
//        delete this.data;
//    }
}  
</script>