import React from 'react'
import {QueryMaterialLibraryTags} from './service'
import {message} from 'antd'
import type {Dispatch, SetStateAction} from 'react';
import type {Dictionary} from 'lodash';
import _ from 'lodash'

type TagContextParams = {
  allTags: MaterialTag.Item[];
  setAllTags: Dispatch<SetStateAction<MaterialTag.Item[]>>;
  setTagsItemsTimestamp: Dispatch<SetStateAction<number>>;
  allTagsMap: Dictionary<MaterialTag.Item>;
}
export const TagContext = React.createContext<TagContextParams>({} as TagContextParams)

const TagProvider: React.FC = (props) => {
  const [allTags, setAllTags] = React.useState<MaterialTag.Item[]>([])
  const [tagsTimestamp, setTagsItemsTimestamp] = React.useState(Date.now);
  const [allTagsMap, setAllTagsMap] = React.useState<Dictionary<MaterialTag.Item>>({})
  const getTagList = (name?: string) => {
    QueryMaterialLibraryTags({page_size: 5000, name}).then((res) => {
      if (res?.code === 0) {
        setAllTags(res?.data?.items)
        setAllTagsMap(_.keyBy<MaterialTag.Item>(res?.data?.items, 'id'))
      } else {
        message.error(res?.message);
      }
    })
  }
  React.useEffect(() => {
    getTagList()
  }, [tagsTimestamp])
  return (
    <TagContext.Provider value={{allTags, setAllTags, setTagsItemsTimestamp, allTagsMap}}>
      {props.children}
    </TagContext.Provider>
  )
}

export default TagProvider;
