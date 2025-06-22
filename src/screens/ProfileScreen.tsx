import React from 'react';
import {SafeAreaView, StyleSheet, Text, View} from 'react-native';

function ProfileScreen(): React.JSX.Element {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.text}>我的页面</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default ProfileScreen; 