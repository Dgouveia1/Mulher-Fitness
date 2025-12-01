export const Utils = {
    escapeHTML(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    },

    isEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    isPhone(phone) {
        const cleaned = phone.replace(/\D/g, '');
        return cleaned.length >= 10 && cleaned.length <= 11;
    },

    isNotEmpty(value) {
        return value && value.trim().length > 0;
    },

    validateForm(data, rules) {
        const errors = {};
        for (const [field, validators] of Object.entries(rules)) {
            for (const validator of validators) {
                const isValid = validator(data[field]);
                if (!isValid) {
                    errors[field] = 'Campo inválido';
                    break;
                }
            }
        }
        return errors;
    },

    showToast(msg, type = 'info') {
        const c = document.getElementById('toast-container');
        if (!c) return;

        const t = document.createElement('div');
        let color = "bg-gray-800";
        let icon = "fa-info-circle";

        if (type === 'success') { color = "bg-green-600"; icon = "fa-check-circle"; }
        if (type === 'error') { color = "bg-red-600"; icon = "fa-exclamation-circle"; }
        if (type === 'warning') { color = "bg-orange-500"; icon = "fa-exclamation-triangle"; }

        t.className = `${color} text-white px-4 py-3 rounded-lg shadow-xl text-sm flex items-center gap-3 animate-fade-in transition-all z-50`;
        t.innerHTML = `<i class="fa-solid ${icon}"></i> ${msg}`;
        c.appendChild(t);
        setTimeout(() => {
            t.style.opacity = '0';
            t.style.transform = 'translateY(-10px)';
            setTimeout(() => t.remove(), 300);
        }, 3000);
    },

    // Nova função para o modal de confirmação
    showConfirm(title, text, onConfirm) {
        const modal = document.getElementById('confirmation-modal');
        const btnYes = document.getElementById('btn-confirm-yes');
        const btnCancel = document.getElementById('btn-confirm-cancel');
        
        document.getElementById('confirm-title').innerText = title;
        document.getElementById('confirm-text').innerText = text;

        modal.classList.remove('hidden');
        modal.classList.add('flex');

        // Limpa listeners antigos para não duplicar ações
        const newBtnYes = btnYes.cloneNode(true);
        btnYes.parentNode.replaceChild(newBtnYes, btnYes);
        
        const newBtnCancel = btnCancel.cloneNode(true);
        btnCancel.parentNode.replaceChild(newBtnCancel, btnCancel);

        // Define novos listeners
        newBtnYes.addEventListener('click', () => {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            onConfirm();
        });

        newBtnCancel.addEventListener('click', () => {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        });
    }
};