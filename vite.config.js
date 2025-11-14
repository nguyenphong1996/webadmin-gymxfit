import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      'dayjs',
      'dayjs/locale/vi',
      '@mui/material',
      '@emotion/react',
      '@emotion/styled',
      '@mui/x-date-pickers',
      '@mui/x-date-pickers/LocalizationProvider',
      '@mui/x-date-pickers/AdapterDayjs',
      '@mui/x-date-pickers/DatePicker',
    ],
  },
});
