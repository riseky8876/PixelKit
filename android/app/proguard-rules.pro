# React Native
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }

# Keep our app classes
-keep class com.pixelkit.** { *; }

# Image picker
-keep class com.imagepicker.** { *; }

# RNFS
-keep class com.rnfs.** { *; }

# Blob util
-keep class com.RNFetchBlob.** { *; }

# QR
-keep class com.google.zxing.** { *; }

-keepattributes *Annotation*
-keepattributes SourceFile,LineNumberTable
-dontwarn java.nio.file.*
-dontwarn org.codehaus.mojo.animal_sniffer.*
