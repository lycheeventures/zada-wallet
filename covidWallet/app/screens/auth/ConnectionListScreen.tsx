import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { CheckBox, FAB } from 'react-native-elements';
import { AppColors } from '../../theme/Colors';
import FadeView from '../../components/FadeView';
import { IConnectionList } from '../../store/connections/interface';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { AppDispatch, useAppDispatch, useAppSelector } from '../../store';
import { selectToken } from '../../store/auth/selectors';
import { acceptMultipleConnection } from '../../store/connections/thunk';

interface INProps {
  route: any;
  navigation: NativeStackNavigationProp<AuthStackParamList>;
}
const ConnectionListScreen = (props: INProps) => {
  // Constants
  const dispatch = useAppDispatch<AppDispatch>();
  const connections = props.route.params.connections;

  // Selectors
  const token = useAppSelector(selectToken);

  // State
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  useEffect(() => {
    connections.map((item: IConnectionList) => {
      if (item.default) {
        setSelectedItems([item._id]);
      }
    });
  }, []);

  const handleSubmit = async () => {
    let metaData: string[] = [];
    selectedItems.forEach((item) => {
      let conn = connections.find((e: IConnectionList) => item === e._id);
      metaData.push(conn.metadata);
    });

    if (metaData.length > 0) {
      dispatch(acceptMultipleConnection(metaData));
      props.navigation.navigate('SecurityScreen', { navigation: props.navigation });
    }
  };

  // Handle checkbox toggle
  const toggleCheckbox = (itemId: string) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter((item) => item !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  // Render individual connection item
  const renderConnectionItem = ({ item }: { item: IConnectionList }) => {
    const isChecked = item.checked;
    return (
      <TouchableOpacity
        disabled={item.default}
        style={item.default ? styles.connectionItemDisabled : styles.connectionItem}
        onPress={() => toggleCheckbox(item._id)}
        activeOpacity={0.5}>
        <CheckBox
          disabled={item.default}
          checkedColor={item.default ? AppColors.LIGHT_GRAY : AppColors.PRIMARY}
          checked={isChecked ? true : selectedItems.includes(item._id) ? true : false}
          onPress={() => toggleCheckbox(item._id)}
        />
        <View style={styles.connectionNameContainer}>
          <Image source={{ uri: item.image }} style={styles.connectionImage} />
          <Text
            style={item.default ? styles.connectionNameDisabled : styles.connectionName}
            numberOfLines={2}>
            {item.name}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <FadeView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={{ flex: 0.4 }}>
          <View style={styles.logoContainer}>
            <Text style={styles.headingText}>Connections</Text>
            <Text style={styles.subHeadingText}>
              Select connections to be connected automatically.
            </Text>
          </View>
        </View>
        <FlatList
          data={connections}
          renderItem={renderConnectionItem}
          keyExtractor={(item) => item._id}
          style={styles.flatListStyle}
          contentContainerStyle={styles.flatListContainerStyle}
        />
        <FAB
          visible={true}
          icon={{ name: 'arrow-forward', color: 'white' }}
          color={AppColors.PRIMARY}
          style={{ alignSelf: 'flex-end', marginBottom: 16, marginRight: 8 }}
          onPress={handleSubmit}
        />
      </View>
    </FadeView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ffffff',
  },
  headingText: {
    fontSize: 40,
    fontFamily: 'Poppins-Bold',
  },
  subHeadingText: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: AppColors.PRIMARY,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
  },
  connectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  connectionItemDisabled: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  connectionNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
  },
  connectionImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  connectionName: {
    fontSize: 14,
    marginHorizontal: 16,
    fontFamily: 'Poppins-Regular',
  },
  connectionNameDisabled: {
    fontSize: 16,
    marginLeft: 16,
    fontFamily: 'Poppins-bold',
    color: AppColors.LIGHT_GRAY,
  },
  flatListStyle: {
    flex: 1,
    marginTop: 16,
    marginBottom: 50,
  },
  flatListContainerStyle: {
    flexGrow: 1,
    paddingTop: 24,
    paddingBottom: 16,
  },
});

export default ConnectionListScreen;
