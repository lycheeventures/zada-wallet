import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { AppColors } from '../theme/Colors';

const UserGuideScreen = () => {
  const [loading, setLoading] = useState(true);
  const [pageLoaded, setPageLoaded] = useState(false);

  return (
    <View style={styles.container}>
      <WebView
        source={{
          uri: 'https://youtube.com/playlist?list=PLxllU3XdIYH7zn9nAzZtY6nWmTzwALAfH&si=6ARuqVPZxJUC-OuM',
        }}
        onLoadStart={() => {
          if (!pageLoaded) {
            setLoading(true);
          }
        }}
        onLoadEnd={() => {
          setPageLoaded(true);
          setLoading(false);
        }}
        onError={() => {
          setLoading(false);
          setPageLoaded(true);
        }}
        javaScriptEnabled
        domStorageEnabled
      />
      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={AppColors.PRIMARY} />
        </View>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    zIndex: 1,
  },
});
export default UserGuideScreen;
