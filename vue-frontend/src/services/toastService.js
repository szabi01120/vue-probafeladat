import { ref } from 'vue';

const toastMessage = ref('');

export function useToast() {
    function showToast(message, duration = 4000) {
        toastMessage.value = message;
        setTimeout(() => toastMessage.value = '', duration);
    }

    return { toastMessage, showToast };
}
