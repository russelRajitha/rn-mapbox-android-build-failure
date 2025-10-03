## This repo is for reproducing the RNMapbox Android build failure with the latest `EXPO` and `EAS`. To run the project, follow these steps.

1. Replace the Mapbox Download token in `app.json`

```json
{
  "expo": {
    "plugins": [
      [
        "@rnmapbox/maps",
        {
          "RNMapboxMapsImpl": "mapbox",
          "RNMapboxMapsDownloadToken": "sk....."
        }
      ]
    ]
  }
}

```

2. Replace your expo project ID in `app.json`

```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "project-id"
      }
    }
  }
}

```

3. Now install dependencies and init the `android` project

```shell
npm run nuke
```

4. Now run Android build via EAS

```shell
npm run eas-binary-build-android-development
```


Now you may see the following error

```shell
[RUN_GRADLEW] FAILURE: Build failed with an exception.
[RUN_GRADLEW] * What went wrong:
[RUN_GRADLEW] Could not determine the dependencies of task ':app:processDebugResources'.
[RUN_GRADLEW] > Could not resolve all dependencies for configuration ':app:debugRuntimeClasspath'.
[RUN_GRADLEW]    > Could not resolve com.mapbox.maps:android-ndk27:10.19.0.
[RUN_GRADLEW]      Required by:
[RUN_GRADLEW]          project :app > project :rnmapbox_maps
[RUN_GRADLEW]       > Could not resolve com.mapbox.maps:android-ndk27:10.19.0.
[RUN_GRADLEW]          > Could not get resource 'https://api.mapbox.com/downloads/v2/releases/maven/com/mapbox/maps/android-ndk27/10.19.0/android-ndk27-10.19.0.pom'.
[RUN_GRADLEW]             > Could not GET 'https://api.mapbox.com/downloads/v2/releases/maven/com/mapbox/maps/android-ndk27/10.19.0/android-ndk27-10.19.0.pom'. Received status code 401 from server: Unauthorized
[RUN_GRADLEW]       > Could not resolve com.mapbox.maps:android-ndk27:10.19.0.
[RUN_GRADLEW]          > Could not get resource 'https://www.jitpack.io/com/mapbox/maps/android-ndk27/10.19.0/android-ndk27-10.19.0.pom'.
[RUN_GRADLEW]             > Could not GET 'https://www.jitpack.io/com/mapbox/maps/android-ndk27/10.19.0/android-ndk27-10.19.0.pom'. Received status code 401 from server: Unauthorized
[RUN_GRADLEW]       > Could not resolve com.mapbox.maps:android-ndk27:10.19.0.
[RUN_GRADLEW]          > Could not get resource 'https://www.jitpack.io/com/mapbox/maps/android-ndk27/10.19.0/android-ndk27-10.19.0.pom'.
[RUN_GRADLEW]             > Could not GET 'https://www.jitpack.io/com/mapbox/maps/android-ndk27/10.19.0/android-ndk27-10.19.0.pom'. Received status code 401 from server: Unauthorized
[RUN_GRADLEW] * Try:
[RUN_GRADLEW] > Run with --stacktrace option to get the stack trace.
[RUN_GRADLEW] > Run with --info or --debug option to get more log output.
[RUN_GRADLEW] > Run with --scan to get full insights.
[RUN_GRADLEW] > Get more help at https://help.gradle.org.
[RUN_GRADLEW] BUILD FAILED in 8s
[RUN_GRADLEW] Deprecated Gradle features were used in this build, making it incompatible with Gradle 9.0.
[RUN_GRADLEW] You can use '--warning-mode all' to show the individual deprecation warnings and determine if they come from your own scripts or plugins.
[RUN_GRADLEW] For more on this, please refer to https://docs.gradle.org/8.14.3/userguide/command_line_interface.html#sec:command_line_warnings in the Gradle documentation.
[RUN_GRADLEW] 28 actionable tasks: 28 executed
[RUN_GRADLEW] Error: Gradle build failed with unknown error. See logs for the "Run gradlew" phase for more information.


```