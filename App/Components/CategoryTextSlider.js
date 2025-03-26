import React, { useState } from 'react'
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

function CategoryTextSlider({selectCategory}) {
    const [active, setActive] = useState(1)

    const categoryList=[
        {
            id:1,
            name:'Latest'
        },
        {
            id:2,
            name:'World'
        },
        {
            id:3,
            name:'Bussiness'
        },
        {
            id:4,
            name:'Sports'
        },
        {
            id:5,
            name:'Life'
        },
        {
            id:6,
            name:'Movie'
        },
        {
            id:7,
            name:'Goverment'
        }

    ]

    const onCategoryClick=(id) => {
        setActive(id)

    }
  return (
    <View style={{marginTop:10}}>
       <FlatList
        data={categoryList}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({item}) => (
            <TouchableOpacity onPress={() => {onCategoryClick(item.id);
             selectCategory(item.name)}}>
                    <Text style={ item.id == active ? styles.selectText : styles.unselectText}>{item.name}</Text>
            </TouchableOpacity>
        )}
       />
    </View>
  )
}

const styles = StyleSheet.create({
  unselectText: {
    marginRight: 10,
    fontSize: 17,
    fontWeight: '500',
    color:'grey'
  },
  selectText: {
    marginRight: 10,
    fontSize: 17,
    fontWeight: 'bold',
    color:'#7d0a0a'
  },
});

export default CategoryTextSlider