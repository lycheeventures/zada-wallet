import React, { useState } from 'react';
import { View, TouchableOpacity, Animated, StyleSheet, RefreshControl } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { SwipeListView } from 'react-native-swipe-list-view';
import { useTranslation } from 'react-i18next';

import TextComponent from '../../components/TextComponent';
import FlatCard from '../../components/FlatCard';
import HeadingComponent from '../../components/HeadingComponent';
import OverlayLoader from '../../components/OverlayLoader';
import PullToRefresh from '../../components/PullToRefresh';
import EmptyList from '../../components/EmptyList';
import { themeStyles } from '../../theme/Styles';
import { AppColors, RED_COLOR, SECONDARY_COLOR } from '../../theme/Colors';

import { useAppSelector } from '../../store';
import { selectConnectionsStatus } from '../../store/connections/selectors';
import { showAskDialog } from '../../helpers/Toast';
import { selectDevelopmentMode } from '../../store/app/selectors';
import { IConnectionObject } from '../../store/connections/interface';
import SelectModal from '../../components/Modal/SelectModal';
import PrimaryButton from '../../components/Buttons/PrimaryButton';
import useConnections from '../../hooks/useConnections';

function ConnectionsScreen() {
  // Selectors
  const { t } = useTranslation();
  const {
    connections,
    connectionlist,
    onAcceptConnection,
    onDeleteConnection,
    refreshConnections,
  } = useConnections();
  const connectionStatus = useAppSelector(selectConnectionsStatus);
  const developmentMode = useAppSelector(selectDevelopmentMode);

  // States
  const [isVisible, setVisible] = useState(false);

  async function handleAddButton() {
    setVisible(true);
  }

  const onConnectionSelect = (label: string, value: string) => {
    onAcceptConnection(value);
    setVisible(false);
  };

  async function onSuccessPress(connection: IConnectionObject) {
    onDeleteConnection(connection.connectionId);
  }

  function onDeletePressed(e) {
    showAskDialog(
      'Are you sure you want to delete this connection?',
      'This will also delete all certificates issued by this connection.',
      () => onSuccessPress(e),
      () => {}
    );
  }

  const refreshHandler = () => {
    refreshConnections();
  };

  // Render Item
  const renderItem = (rowData: { item: IConnectionObject }) => {
    let imgURI = rowData.item.imageUrl;
    let header = rowData.item.name != undefined ? rowData.item.name : '';
    let subtitle =
      'The connection between you and ' + header.toLowerCase() + ' is secure and encrypted.';
    return <FlatCard onPress={() => {}} imageURL={imgURI} heading={header} text={subtitle} />;
  };

  const renderHiddenItem = ({ item, index }: { item: IConnectionObject; index: number }) => {
    return (
      <View key={index + item.connectionId} style={styles.rowBack}>
        <TextComponent text="" />
        <Animated.View>
          <TouchableOpacity
            onPress={() => onDeletePressed(item)}
            activeOpacity={0.8}
            style={[styles.swipeableViewStyle]}>
            <MaterialCommunityIcons size={30} name="delete" color={RED_COLOR} />
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  // Empty List Component
  const listEmptyComponent = () => (
    <EmptyList
      text={t('ConnectionsScreen.list_empty_text')}
      image={require('../../assets/images/connectionsempty.png')}
      onRefresh={() => {}}
      refreshing={false}
    />
  );

  return (
    <View style={themeStyles.mainContainer}>
      <PullToRefresh />
      <HeadingComponent text={t('common.connections')} />
      {connectionStatus === 'pending' && <OverlayLoader text="Deleting connection..." />}
      {connectionStatus === 'accepting_connection' && (
        <OverlayLoader text="Creating Connection..." />
      )}

      <View
        style={styles.viewStyle}
        pointerEvents={connectionStatus === 'pending' ? 'none' : 'auto'}>
        <SwipeListView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              tintColor={'#7e7e7e'}
              refreshing={connectionStatus === 'loading'}
              onRefresh={refreshHandler}
            />
          }
          useFlatList
          disableRightSwipe
          disableLeftSwipe={!developmentMode}
          ListEmptyComponent={listEmptyComponent}
          data={connections}
          style={styles.flatListStyle}
          contentContainerStyle={styles.flatListStyle}
          keyExtractor={(rowData, index) => {
            return index + rowData.connectionId;
          }}
          renderItem={renderItem}
          renderHiddenItem={renderHiddenItem}
          leftOpenValue={75}
          rightOpenValue={-75}
        />
      </View>
      {connectionlist.length > 0 && (
        <>
          <PrimaryButton
            onPress={handleAddButton}
            icon={{
              name: 'add',
              color: AppColors.WHITE,
            }}
            buttonStyle={{
              alignSelf: 'flex-end',
              borderRadius: 25,
              width: 50,
              height: 50,
              backgroundColor: AppColors.PRIMARY,
            }}
            buttonContainerStyle={{
              marginHorizontal: 8,
              marginVertical: 8,
            }}
          />

          <SelectModal
            title={t('ConnectionsScreen.select_connections')}
            subTitle="Select a connection to add"
            isVisible={isVisible}
            data={connectionlist}
            onSelect={onConnectionSelect}
            onClose={() => setVisible(false)}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  MainContainer: {
    flex: 1,
    alignItems: 'center',
  },
  viewStyle: { flex: 1 },
  EmptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBack: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 15,
  },
  flatListStyle: {
    flexGrow: 1,
  },
  swipeableViewStyle: {
    width: 60,
    height: 60,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 30,
    shadowColor: SECONDARY_COLOR,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 5,
    flexDirection: 'row',
    marginBottom: 8,
  },
});

export default ConnectionsScreen;
