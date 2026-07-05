document.addEventListener('DOMContentLoaded', function () {
  const revealElements = document.querySelectorAll('.reveal');
  const navToggle = document.querySelector('.nav-toggle');
  const mainNav = document.querySelector('.main-nav');
  const navLinks = document.querySelectorAll('.main-nav a');
  const dateInputs = document.querySelectorAll('input[type="date"]');
  const filterButtons = document.querySelectorAll('[data-filter]');
  const menuItems = document.querySelectorAll('[data-category]');

  const todayValue = function () {
    const today = new Date();
    return [today.getFullYear(), String(today.getMonth() + 1).padStart(2, '0'), String(today.getDate()).padStart(2, '0')].join('-');
  };

  dateInputs.forEach(function (input) {
    input.min = todayValue();
  });

  const setNavOpen = function (open) {
    if (!navToggle || !mainNav) return;
    navToggle.classList.toggle('open', open);
    mainNav.classList.toggle('open', open);
    document.body.classList.toggle('nav-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
  };

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () {
      setNavOpen(!mainNav.classList.contains('open'));
    });
  }

  navLinks.forEach(function (link) {
    link.addEventListener('click', function () { setNavOpen(false); });
  });

  if ('IntersectionObserver' in window && revealElements.length) {
    const observer = new IntersectionObserver(function (entries, observerRef) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observerRef.unobserve(entry.target);
        }
      });
    }, { threshold: 0.16 });
    revealElements.forEach(function (element) { observer.observe(element); });
  } else {
    revealElements.forEach(function (element) { element.classList.add('visible'); });
  }

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      const filter = button.dataset.filter;
      filterButtons.forEach(function (item) {
        item.classList.toggle('active', item === button);
        item.setAttribute('aria-pressed', String(item === button));
      });
      menuItems.forEach(function (item) {
        const categories = (item.dataset.category || '').split(' ');
        item.hidden = filter !== 'all' && !categories.includes(filter);
      });
    });
  });

  const validateEmail = function (value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const validatePhone = function (value) {
    const digits = value.replace(/[^0-9]/g, '');
    return digits.length >= 6 && digits.length <= 15;
  };

  const setFieldError = function (field, message) {
    const error = document.getElementById(field.id + 'Error');
    field.classList.toggle('error', Boolean(message));
    if (error) error.textContent = message || '';
  };

  const showMessage = function (form, message, isError) {
    const target = form.querySelector('.form-message');
    if (!target) return;
    target.textContent = message;
    target.classList.toggle('error', Boolean(isError));
  };

  const fieldValue = function (form, name) {
    const field = form.querySelector('[name="' + name + '"]');
    return field ? field.value.trim() : '';
  };

  const validateForm = function (form) {
    let valid = true;
    const required = form.querySelectorAll('[required]');
    form.querySelectorAll('input, textarea, select').forEach(function (field) { setFieldError(field, ''); });
    required.forEach(function (field) {
      if (!field.value.trim()) {
        setFieldError(field, 'Este campo es obligatorio.');
        valid = false;
      }
    });
    const email = form.querySelector('[type="email"]');
    if (email && email.value.trim() && !validateEmail(email.value.trim())) {
      setFieldError(email, 'Introduce un correo válido.');
      valid = false;
    }
    const phone = form.querySelector('[type="tel"]');
    if (phone && phone.value.trim() && !validatePhone(phone.value.trim())) {
      setFieldError(phone, 'Introduce un teléfono válido.');
      valid = false;
    }
    const guests = form.querySelector('[name="guests"]');
    if (guests && guests.value) {
      const amount = Number(guests.value);
      if (Number.isNaN(amount) || amount < 1 || amount > 20) {
        setFieldError(guests, 'Indica entre 1 y 20 comensales.');
        valid = false;
      }
    }
    const date = form.querySelector('[type="date"]');
    if (date && date.value && date.value < todayValue()) {
      setFieldError(date, 'La fecha no puede ser anterior a hoy.');
      valid = false;
    }
    return valid;
  };

  document.querySelectorAll('form[data-form-type]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!validateForm(form)) {
        showMessage(form, 'Revisa los campos marcados e inténtalo de nuevo.', true);
        return;
      }

      const restaurant = document.body.dataset.restaurant || 'el restaurante';
      const type = form.dataset.formType === 'reservation' ? 'reserva' : 'mensaje';
      const reference = restaurant.substring(0, 3).toUpperCase() + '-' + Date.now().toString().slice(-6);
      const subject = encodeURIComponent('Nueva ' + type + ' - ' + restaurant + ' - ' + reference);
      const body = encodeURIComponent(
        'Referencia: ' + reference + '\n' +
        'Nombre: ' + fieldValue(form, 'name') + '\n' +
        'Email: ' + fieldValue(form, 'email') + '\n' +
        'Teléfono: ' + fieldValue(form, 'phone') + '\n' +
        (fieldValue(form, 'guests') ? 'Comensales: ' + fieldValue(form, 'guests') + '\n' : '') +
        (fieldValue(form, 'date') ? 'Fecha: ' + fieldValue(form, 'date') + '\n' : '') +
        (fieldValue(form, 'time') ? 'Hora: ' + fieldValue(form, 'time') + '\n' : '') +
        (fieldValue(form, 'occasion') ? 'Motivo: ' + fieldValue(form, 'occasion') + '\n' : '') +
        'Mensaje: ' + fieldValue(form, 'message')
      );
      const email = document.body.dataset.email || 'reservas@example.com';
      showMessage(form, 'Solicitud registrada. Referencia ' + reference + '. Se abrirá tu correo para enviar la confirmación.', false);
      form.reset();
      dateInputs.forEach(function (input) { input.min = todayValue(); });
      window.location.href = 'mailto:' + email + '?subject=' + subject + '&body=' + body;
    });
  });
});
