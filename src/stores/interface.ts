import { defineStore } from "pinia";

export const useInterfaceStore = defineStore({
    id: "interface",
    state: () => ({
        loading: false
    }),
    actions: {
        setLoading(loading: boolean){
            this.loading = loading;
        }
    }
})