# استخدم صورة Node.js الرسمية
FROM node:18

# تثبيت pm2 بشكل عالمي
RUN npm install -g pm2

# تحديد مجلد العمل داخل الكونتينر
WORKDIR /app

# تثبيت الـ dependencies
RUN npm install

# نسخ باقي ملفات المشروع
COPY . .

# إتاحة البورت
EXPOSE 8000

# تشغيل التطبيق باستخدام pm2-runtime
CMD ["pm2-runtime", "server.js", "--name", "http-server"]
