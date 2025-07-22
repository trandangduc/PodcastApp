# PodcastApp
Ứng dụng podcast được xây dựng bằng React Native và Expo.

## Yêu cầu hệ thống
- **Node.js**: phiên bản 18.0.0 trở lên (khuyến nghị: 18.17.0 hoặc 20.5.0)
- **npm**: phiên bản 8.0.0 trở lên (khuyến nghị: 9.8.0)
- **Expo CLI**: phiên bản mới nhất (cài đặt: `npm install -g @expo/cli`)

### Kiểm tra phiên bản hiện tại
```bash
node --version    # Kiểm tra Node.js
npm --version     # Kiểm tra npm
expo --version    # Kiểm tra Expo CLI
```

## Các phiên bản dependencies chính
- **React**: 19.0.0
- **React Native**: 0.79.5
- **Expo SDK**: 53.0.17
- **TypeScript**: 5.8.3
- **Redux Toolkit**: 2.8.2
- **React Navigation**: 7.x
- **React Native Track Player**: 4.1.1

## Cài đặt
1. **Clone repository về máy**
```bash
git clone https://github.com/yourusername/PodcastApp.git
cd PodcastApp
```

2. **Cài đặt Expo CLI (nếu chưa có)**
```bash
npm install -g @expo/cli
```

3. **Cài đặt dependencies**
```bash
npm install
```

## Chạy ứng dụng
### Khởi động development server
```bash
npm start
```

### Chạy trên Android
**Cách 1: Sử dụng Expo Go (Khuyến nghị)**
1. Tải ứng dụng **Expo Go** từ Google Play Store
   - Yêu cầu: Android 5.0+ (API level 21+)
   - Link: https://play.google.com/store/apps/details?id=host.exp.exponent
2. Chạy `npm start` trong terminal
3. Quét mã QR bằng ứng dụng Expo Go

**Cách 2: Sử dụng Android Emulator**
1. Cài đặt **Android Studio** (phiên bản mới nhất)
   - Download: https://developer.android.com/studio
   - Cài đặt Android SDK (API level 31 trở lên)
2. Tạo và khởi động Android Virtual Device (AVD)
3. Chạy lệnh:
```bash
npm run android
```

### Chạy trên iOS
**Cách 1: Sử dụng Expo Go (Khuyến nghị)**
1. Tải ứng dụng **Expo Go** từ App Store
   - Yêu cầu: iOS 13.0+
   - Link: https://apps.apple.com/app/expo-go/id982107779
2. Chạy `npm start` trong terminal
3. Quét mã QR bằng ứng dụng Camera hoặc Expo Go

**Cách 2: Sử dụng iOS Simulator (chỉ trên macOS)**
1. Cài đặt **Xcode** từ Mac App Store
   - Yêu cầu: Xcode 14.0+, macOS 12.5+
   - Cài đặt Command Line Tools: `xcode-select --install`
2. Chạy lệnh:
```bash
npm run ios
```

### Chạy trên Web Browser
```bash
npm run web
```
Ứng dụng sẽ mở tại: http://localhost:19006

## Lệnh có sẵn
```bash
npm start          # Khởi động development server
npm run android    # Chạy trên Android
npm run ios        # Chạy trên iOS
npm run web        # Chạy trên web
```

## Xử lý lỗi thường gặp
### Lỗi cache Metro bundler
```bash
npx expo start --clear
```

### Lỗi dependencies
```bash
# Xóa node_modules và cài đặt lại
rm -rf node_modules
npm install
```

### Lỗi Android build
```bash
cd android && ./gradlew clean && cd ..
npx expo start --clear
```

## Build production
### Sử dụng EAS Build
1. Cài đặt EAS CLI:
```bash
npm install -g eas-cli
```

2. Đăng nhập và cấu hình:
```bash
eas login
eas build:configure
```

3. Build cho platform:
```bash
eas build --platform android
eas build --platform ios
```

## Ghi chú
- **Android**: Cần cài đặt Android Studio và Android SDK
- **iOS**: Cần macOS và Xcode (chỉ để build native)
- **Cách dễ nhất**: Sử dụng ứng dụng Expo Go trên điện thoại
- **Development**: Hỗ trợ hot reload và debugging
- **Production**: Sử dụng EAS Build để tạo file APK/IPA

## Tác giả
Tran Dang Duc