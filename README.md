# FilterCam

> A camera app for trying a look live, taking a photo, and saving the filtered result.

[![Expo SDK](https://img.shields.io/badge/Expo-SDK%2057-000020?logo=expo)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React%20Native-0.86.3-61DAFB?logo=react)](https://reactnative.dev/)
[![Platform](https://img.shields.io/badge/platform-Android%20first-3DDC84?logo=android)](https://www.android.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

FilterCam is a small, Android-first camera app for people who want to see a color treatment before taking a photo. It applies the selected look to both the live camera preview and the captured image, then lets you browse, edit, share, or save images from the app.

## Screenshots and demo

Screenshots and a demo are not currently included in this repository. Suggested locations:

<!-- Add screenshots at these paths, then replace the placeholders with Markdown image links. -->
- `docs/screenshots/camera.png` — camera screen with a selected filter
- `docs/screenshots/editor.png` — photo editor and filter choices
- `docs/screenshots/gallery.png` — in-app gallery
- `docs/screenshots/preview.png` — photo preview and save actions
- `docs/demo.gif` — short capture and edit walkthrough

## Highlights

- **Live filter preview:** Choose a filter from the camera screen and see its color-matrix treatment on the viewfinder.
- **Photo capture:** Take a photo with the back camera. The capture button shows a loading indicator while it is processing.
- **Filtered exports:** The selected filter is applied to the captured image before the app stores its own copy.
- **Filter editor:** Open a photo, compare the available filter previews, and save an edited copy to the in-app gallery.
- **Recent photo shortcut:** Open the latest photo captured in the current camera screen session.
- **In-app gallery:** Browse photos saved in FilterCam in a two-column grid and open them in the preview screen.
- **Device gallery and sharing:** Save a photo to the device media library or open the system share sheet.
- **Flash control:** Toggle the flash when the selected back camera reports flash support.

## Filters

The looks below describe the intent of each matrix; the result can vary with lighting and the source photo.

| Filter | Look |
| --- | --- |
| `none` | Original colors, with no color matrix applied |
| `grayscale` | Neutral black and white |
| `sepia` | Warm, brown-toned vintage |
| `invert` | Inverted colors |
| `warm` | Slightly warmer reds and highlights |
| `cool` | Cooler blue tones |
| `retro90s` | Faded contrast with a warm-green cast |
| `vhs` | Slightly desaturated with cyan shadows and a red push |
| `polaroid` | Stronger contrast with creamy highlights |
| `kodachrome` | Rich, warm film-inspired colors |
| `technicolor` | Punchy, highly saturated colors |
| `cyberpunk` | Magenta and cyan neon tones |
| `noir` | High-contrast black and white |
| `sunset` | Golden-orange evening tones |
| `dreamy` | Soft pastel tones and lifted shadows |
| `matrix` | Green terminal-inspired tint |

## Tech stack

| Tool | Use |
| --- | --- |
| Expo SDK `~57.0.31` | App runtime, native configuration, and development tooling |
| React Native `0.86.3` | Cross-platform mobile UI |
| Expo Router `~57.0.29` | File-based routes and screen navigation |
| React Native Vision Camera `^5.2.3` | Camera device access and photo capture |
| `react-native-vision-camera-skia` `^5.2.3` | Skia-backed live camera preview |
| Shopify React Native Skia `2.6.2` | Color-matrix rendering and offscreen image processing |
| Expo Media Library `~57.0.5` | Permission request and saving images to the device gallery |
| Expo File System `~57.0.7` | App-managed photo storage and filtered-image files |
| Expo Image `~57.0.5` | Photo previews and gallery thumbnails |
| Expo Sharing `~57.0.24` | Native share sheet for a photo |
| Lucide React Native `^1.61.0` | Interface icons |
| React Native Reanimated `4.5.1` and Worklets `^0.10.1` | Animation and worklet runtime used by the camera/Skia stack |

## Getting started

### Prerequisites

- Node.js and npm
- Android Studio with an Android SDK and either an emulator or a connected Android device
- A development build of the app (Vision Camera uses native code and does not run in Expo Go)

The Android configuration sets `minSdkVersion` to **26**.

### Install dependencies

From the project root:

```bash
npm ci
```

### Build and run on Android

Create and launch the native development build:

```bash
npx expo run:android
```

For later JavaScript/Metro sessions, start Expo in development-client mode:

```bash
npx expo start --dev-client
```

Then open the installed development build on the emulator or device. If you use `npm run android`, it runs `expo start --android`; it does not replace the first native development build.

### Common commands

```bash
npm start             # Start the Expo development server
npm run android       # Start Expo and target a connected Android device/emulator
npm run ios           # Start Expo and target iOS (native camera behavior is not documented as tested)
npm run web           # Start the web target
npm run lint          # Run Expo lint
npx tsc --noEmit      # Type-check the project
```

The `reset-project` script is also present, but it is a starter-template reset utility and is not needed for normal development.

## Project structure

```text
camera-filter-app/
├── assets/                  # App icons and image assets
├── plugins/                 # Expo config plugins (currently empty)
├── scripts/                 # Project scripts (currently empty)
├── src/
│   ├── app/
│   │   ├── _layout.tsx      # Root Expo Router stack
│   │   ├── index.tsx         # Camera, live filters, and capture
│   │   ├── gallery.tsx       # App-managed photo gallery
│   │   ├── preview.tsx       # Photo preview, save, and share
│   │   └── editor.tsx        # Apply another filter and save a copy
│   ├── constants/
│   │   ├── filters.ts        # Color-matrix definitions
│   │   └── theme.ts          # Shared theme values
│   ├── store/
│   │   └── storeImage.tsx    # App file storage, media-library save, sharing
│   └── utils/
│       └── applyFilter.tsx   # Offscreen Skia photo filtering
├── app.json                 # Expo identity, plugins, and native permissions
├── eas.json                 # EAS build profiles
├── package.json             # Dependencies and npm scripts
└── tsconfig.json            # TypeScript configuration and aliases
```

Android and iOS native project folders are not checked in; Expo generates them when building locally.

## How it works

### Live camera preview

The camera screen selects the back camera with `useCameraDevice("back")`. After the screen has laid out, it mounts `SkiaCamera`. On each frame, its `onFrame` worklet draws the frame texture to the Skia canvas using a `Skia.Paint`; the selected filter's 4×5 color matrix is set on that paint. The `isActive` prop follows camera permission and route focus, so the camera is active only while the camera route is focused and permission is granted.

### Capture and saved photo

The app captures a photo with Vision Camera, applies the selected matrix with an offscreen Skia surface, and copies the result into the app's `FilterCam` documents folder. The app gallery lists files from this folder. Saving from the preview screen is a separate action: it asks for media-library permission and creates an asset in the device gallery.

```text
Camera frame ──> SkiaCamera + selected matrix ──> live preview
       │
Photo capture ──> Skia offscreen filter ──> app's FilterCam folder
                                              ├──> in-app gallery
                                              └──> explicit save to device gallery
```

The editor follows the same offscreen filtering path when saving an edited copy. Selecting `none` keeps the original photo URI rather than rendering a color matrix.

## Permissions

| Permission | Why it is needed |
| --- | --- |
| Camera | Required to show the viewfinder and capture photos. Android requests `android.permission.CAMERA`; the iOS config includes a camera usage description. |
| Photo/media library | Requested when using **Save to Device** so the app can create an image asset in the device gallery. Expo's media-library plugin also configures photo access text and granular photo permission. |

The app-managed `FilterCam` folder is separate from the device media library. The in-app gallery reads that app folder; it does not scan all photos on the device.

## Known issues and troubleshooting

### Android CameraX: `createWindowContext failed! Too many unused window contexts`

This message has been reported when Android camera sessions are reconfigured repeatedly. Repeatedly switching camera devices or recreating camera views can put pressure on the camera/window context lifecycle. FilterCam currently uses a fixed back-camera device and keeps `isActive` tied to permission and route focus. It also waits for the camera screen's first layout before mounting `SkiaCamera`.

**Important:** The current source does not include front/back flip controls, a flip debounce, or an automatic camera retry keyed by component remount. Those mitigations should not be assumed to be present. If the warning occurs, capture the full Android log and device/OS details before adding retry logic; repeated remounts can worsen camera reconfiguration problems.

### Camera not available in an emulator

The camera screen displays a message if no back camera is found. In Android Emulator settings, check **Camera → Back** and choose an available source such as **Emulated** or **Webcam0**. A physical Android device is a useful comparison when debugging emulator-only camera behavior.

### No flash control or flash effect

The flash button is disabled when the selected back camera reports that it has no flash. Emulators may not provide flash hardware.

### Expo Go cannot load the camera

Vision Camera and the Skia camera integration require native modules. Install and open a development build created with `npx expo run:android`; Expo Go is not sufficient.

### Device gallery permission denied

The app will not save to the device gallery without the requested media-library permission. Grant photo access in Android settings and retry. App-captured photos can still be listed in the app-managed gallery folder.

## Roadmap

These are possible next steps, not features currently implemented:

- Add filter intensity control and custom shader filters.
- Add filtered video recording.
- Add capture-time orientation and mirror handling for a front camera.
- Implement front/back camera switching, with carefully tested camera lifecycle handling.
- Test and polish iOS support.
- Tune frame processing for lower-end devices.
- Improve the in-app gallery with delete and share actions.
- Add onboarding and localization.
- Add unit and end-to-end tests.

## Contributing

Issues, bug reports, and focused pull requests are welcome. For camera or platform-specific reports, include the device or emulator model, Android/iOS version, steps to reproduce, and relevant logs. Please avoid including private photos or other sensitive data in reports.

## License and author

This repository currently contains the Expo template's MIT license. Confirm the copyright holder and licensing terms for this project before distributing it; see [`LICENSE`](./LICENSE).

**Author:** TODO — Shree Krishna Dixit