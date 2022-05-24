<template>
    <ThePageContainer :pageHeading="dto.screenTitle">
        <!-- @@TODO : Enter your code here -->
    </ThePageContainer>
</template>

<script lang="ts">
import { Vue } from "vue-property-decorator";
import { Component } from "vue-class-component";
import { SSR22222DTO } from "@/dto/SSR22222/SSR22222DTO";
import { SSR22222Data } from "@/data/SSR22222/SSR22222Data";

@Component({
})
export default class SSR22222 extends Vue {
    public dto = new SSR22222DTO();
    public data = new SSR22222Data();

//    beforeDestroy() {
//        this.dto = null;
//        delete this.dto;
//        this.data = null;
//        delete this.data;
//    }
}  
</script>