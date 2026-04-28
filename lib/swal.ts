import Swal from "sweetalert2"

const ACCENT = "#ffffff"
const BORDER = "#737373"

const swalBase = Swal.mixin({
  customClass: {
    popup: "mm-popup",
    title: "mm-title",
    htmlContainer: "mm-content",
    confirmButton: "mm-confirm-btn",
    cancelButton: "mm-cancel-btn",
    denyButton: "mm-deny-btn",
    icon: "mm-icon",
  },
  background: "#0a0a0a",
  color: "#fff",
  backdrop: "rgba(0, 0, 0, 0.85)",
  buttonsStyling: false,
  showClass: { popup: "" },
  hideClass: { popup: "" },
})

export const swal = {
  success: (title: string, message?: string, duration = 2800) => {
    return swalBase.fire({
      icon: "success",
      title,
      text: message,
      timer: duration,
      timerProgressBar: true,
      showConfirmButton: false,
      iconColor: ACCENT,
    })
  },

  error: (title: string, message?: string) => {
    return swalBase.fire({
      icon: "error",
      title,
      text: message,
      confirmButtonText: "Entendido",
      iconColor: "#ef4444",
    })
  },

  loading: (title: string) => {
    return swalBase.fire({
      title,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading()
      },
    })
  },

  confirm: async (
    title: string,
    message: string,
    confirmText?: string,
    cancelText?: string,
    html?: string,
  ) => {
    const result = await swalBase.fire({
      icon: "question",
      title,
      text: message,
      html,
      showCancelButton: true,
      confirmButtonText: confirmText || "Continuar",
      cancelButtonText: cancelText || "Cancelar",
      iconColor: ACCENT,
      reverseButtons: true,
    })
    return result.isConfirmed
  },

  close: () => {
    Swal.close()
  },

  update: (config: any) => {
    Swal.update(config)
  },
}

export const showAlert = (
  type: "success" | "error" | "info" | "warning",
  title: string,
  message?: string,
  duration?: number,
) => {
  if (type === "success") {
    return swal.success(title, message, duration)
  } else if (type === "error") {
    return swal.error(title, message)
  } else if (type === "info") {
    return swalBase.fire({
      icon: "info",
      title,
      text: message,
      confirmButtonText: "Entendido",
      iconColor: ACCENT,
    })
  } else if (type === "warning") {
    return swalBase.fire({
      icon: "warning",
      title,
      text: message,
      confirmButtonText: "Entendido",
      iconColor: ACCENT,
    })
  }
}

if (typeof document !== "undefined" && !document.getElementById("mm-swal-style")) {
  const style = document.createElement("style")
  style.id = "mm-swal-style"
  style.textContent = `
    .mm-popup {
      border: 1px solid rgba(115, 115, 115, 0.5) !important;
      border-radius: 2px !important;
      box-shadow: 0 30px 60px rgba(0, 0, 0, 0.7) !important;
      padding: 2.25rem 2rem !important;
      max-width: 420px !important;
      font-family: inherit !important;
    }

    .mm-title {
      font-size: 1.05rem !important;
      font-weight: 800 !important;
      letter-spacing: 0.04em !important;
      color: #fff !important;
      margin: 0.75rem 0 0.5rem !important;
      line-height: 1.35 !important;
    }

    .mm-content {
      font-size: 0.875rem !important;
      color: ${BORDER} !important;
      line-height: 1.6 !important;
      margin-top: 0 !important;
    }

    .swal2-actions {
      gap: 0.5rem !important;
      margin-top: 1.5rem !important;
      width: 100% !important;
    }

    .mm-confirm-btn, .mm-cancel-btn, .mm-deny-btn {
      border-radius: 0 !important;
      padding: 0.85rem 1.5rem !important;
      font-weight: 800 !important;
      font-size: 0.7rem !important;
      letter-spacing: 0.18em !important;
      text-transform: uppercase !important;
      transition: opacity 0.2s ease, background 0.2s ease, border-color 0.2s ease !important;
      border: 1px solid transparent !important;
      flex: 1 !important;
      min-height: 2.75rem !important;
      cursor: pointer !important;
    }

    .mm-confirm-btn {
      background: ${ACCENT} !important;
      color: #000 !important;
    }
    .mm-confirm-btn:hover { opacity: 0.85 !important; }
    .mm-confirm-btn:focus { outline: none !important; box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.25) !important; }

    .mm-cancel-btn {
      background: transparent !important;
      color: ${BORDER} !important;
      border-color: ${BORDER} !important;
    }
    .mm-cancel-btn:hover {
      color: #fff !important;
      border-color: #fff !important;
    }
    .mm-cancel-btn:focus { outline: none !important; box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1) !important; }

    .mm-deny-btn {
      background: transparent !important;
      color: #ef4444 !important;
      border-color: rgba(239, 68, 68, 0.4) !important;
    }
    .mm-deny-btn:hover {
      background: rgba(239, 68, 68, 0.08) !important;
      border-color: #ef4444 !important;
    }

    .swal2-icon { display: none !important; }
    .swal2-icon.swal2-success [class^='swal2-success-line'],
    .swal2-icon.swal2-success .swal2-success-ring {
      border-color: ${ACCENT} !important;
    }
    .swal2-icon.swal2-success .swal2-success-line-tip,
    .swal2-icon.swal2-success .swal2-success-line-long {
      background-color: ${ACCENT} !important;
    }
    .swal2-icon.swal2-error [class^='swal2-x-mark-line'] {
      background-color: #ef4444 !important;
    }
    .swal2-icon.swal2-warning,
    .swal2-icon.swal2-question {
      color: ${ACCENT} !important;
      border-color: ${ACCENT} !important;
    }
    .swal2-icon.swal2-info {
      color: ${ACCENT} !important;
      border-color: ${ACCENT} !important;
    }

    .swal2-timer-progress-bar {
      background: ${ACCENT} !important;
      height: 2px !important;
    }

    .swal2-loader {
      border-color: ${ACCENT} transparent ${ACCENT} transparent !important;
      width: 2.5rem !important;
      height: 2.5rem !important;
    }

    .swal2-close {
      color: rgba(255, 255, 255, 0.4) !important;
      font-size: 1.5rem !important;
    }
    .swal2-close:hover { color: #fff !important; }

    .swal2-container,
    .swal2-container *,
    .swal2-popup,
    .swal2-popup *,
    .swal2-show,
    .swal2-hide,
    .swal2-backdrop-show,
    .swal2-backdrop-hide,
    .swal2-icon-show,
    .swal2-icon-hide {
      animation: none !important;
      transition: none !important;
    }

    @media (max-width: 480px) {
      .mm-popup { padding: 1.75rem 1.25rem !important; max-width: calc(100vw - 2rem) !important; }
      .swal2-actions { flex-direction: column-reverse !important; }
      .mm-confirm-btn, .mm-cancel-btn, .mm-deny-btn { width: 100% !important; }
    }
  `
  document.head.appendChild(style)
}
