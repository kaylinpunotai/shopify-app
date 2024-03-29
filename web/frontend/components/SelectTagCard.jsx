import { TextStyle, Stack, Tag, Listbox, EmptySearchResult, Combobox, Card, Select } from "@shopify/polaris";
import { LoadingCard } from "./LoadingCard";
import { useState, useCallback, useMemo } from "react";
import { useAppQuery, useAuthenticatedFetch } from "../hooks";


// props 
// str TagType = "Material" or "Color"
// str ExistingTags = initial string of selected tags. Need to convert to string array.
// function PassValue(newValue) = updates selected tags in parent form
function SelectTag( props ) {
  const existingTags = JSON.parse(props.ExistingTags);
  const [selectedTags, setSelectedTags] = useState(existingTags);
  const [value, setValue] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const updateSelection = useCallback(
    (selected) => {
      const nextSelectedTags = new Set([...selectedTags]);

      if (nextSelectedTags.has(selected)) {
        nextSelectedTags.delete(selected);
      } else {
        nextSelectedTags.add(selected);
      }
      setSelectedTags([...nextSelectedTags]);
      props.PassValue([...nextSelectedTags]);
      setValue("");
      setSuggestion("");
    },
    [selectedTags]
  );

  const removeTag = useCallback(
    (tag) => () => {
      updateSelection(tag);
    },
    [updateSelection]
  );

  const formatOptionText = useCallback(
    (option) => {
      const trimValue = value.trim().toLocaleLowerCase();
      const matchIndex = option.toLocaleLowerCase().indexOf(trimValue);

      if (!value || matchIndex === -1) return option;

      const start = option.slice(0, matchIndex);
      const highlight = option.slice(matchIndex, matchIndex + trimValue.length);
      const end = option.slice(matchIndex + trimValue.length, option.length);

      return (
        <p>
          {start}
          <TextStyle variation="strong">{highlight}</TextStyle>
          {end}
        </p>
      );
    },
    [value]
  );

  // Query distinct tag names from the tag_entries table
  let queryTags = [];
  ({data: queryTags} = useAppQuery( {
    url: `/api/tag_entries/${props.TagType}`,
    reactQueryOptions: {
      onSuccess: () => {
        setIsLoading(false);
      },
    },
  }));

  // Get values in dropdown menu by combining queried tags with existing tags
  const options = !isLoading && queryTags.length > 0 ? (
    [...new Set([...queryTags, ...selectedTags].sort())]
  ) : (
    [...selectedTags]
  );

  const verticalContentMarkup =
    selectedTags.length > 0 ? (
      <Stack spacing="extraTight" alignment="center">
        {selectedTags.map((tag) => (
          <Tag key={`option-${tag}`} onRemove={removeTag(tag)}>
            {tag}
          </Tag>
        ))}
      </Stack>
    ) : null;

  const optionMarkup = !isLoading ? (
    options.map((option) => {
      return (
        <Listbox.Option
          key={option}
          value={option}
          selected={selectedTags.includes(option)}
          accessibilityLabel={option}
        >
          <Listbox.TextOption selected={selectedTags.includes(option)}>
            {formatOptionText(option)}
          </Listbox.TextOption>
        </Listbox.Option>
      );
    })
  ) : null;
        

  const noResults = value && !options.includes(value);

  const actionMarkup = noResults ? (
    <Listbox.Action value={value}>{`Add "${value}"`}</Listbox.Action>
  ) : null;

  // Show Loading card when getting data
  const loadingMarkup = isLoading ? (
    <LoadingCard/>
  ) : null;

  const emptyStateMarkup = !isLoading && optionMarkup ? null : (
    <EmptySearchResult
      title=""
      description={`No tags found matching "${value}"`}
    />
  );

  const listboxMarkup =
    !isLoading && (optionMarkup || actionMarkup || emptyStateMarkup) ? (
      <Listbox
        autoSelection="FIRST"
        onSelect={updateSelection}
      >
        {actionMarkup}
        {optionMarkup}
      </Listbox>
    ) : null;
  
    
  return (
    <Combobox
      allowMultiple
      activator={
        <Combobox.TextField
          autoComplete="off"
          label="Search tags"
          labelHidden
          value={value}
          suggestion={suggestion}
          placeholder="Type to search or add new tags"
          verticalContent={verticalContentMarkup}
          onChange={setValue}
        />
      }
    >
      {loadingMarkup}
      {listboxMarkup}
    </Combobox>
  );
}

export class SelectTagCard extends React.Component {

  render() {
    const tagType = this.props.TagType;
    const existingTags = this.props.Content;
    const passValue = this.props.PassValue;

    return(
      <Card title={tagType + " Tags"} sectioned>
        <SelectTag TagType={tagType} ExistingTags={existingTags} PassValue={passValue}></SelectTag>
      </Card>
    );
  }
}