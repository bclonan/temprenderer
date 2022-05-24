<template>
    <ThePageContainer :pageHeading="dto.screenTitle">
        <!-- @@TODO : Enter your code here -->
    </ThePageContainer>
</template>

<script lang="ts">
import { Vue } from "vue-property-decorator";
import { Component } from "vue-class-component";
import { SSR11233DTO } from "@/dto/SSR11233/SSR11233DTO";
import { SSR11233Data } from "@/data/SSR11233/SSR11233Data";

@Component({
})
export default class SSR11233 extends Vue {
    public dto = new SSR11233DTO();
    public data = new SSR11233Data();

//    beforeDestroy() {
//        this.dto = null;
//        delete this.dto;
//        this.data = null;
//        delete this.data;
//    }
}  
</script>