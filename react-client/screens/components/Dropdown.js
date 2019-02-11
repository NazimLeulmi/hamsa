import styled from "styled-components";
import React from "react";
import { TouchableHighlight } from "react-native";

const DropDownContainer = styled.View`
  width: 150;
  display: flex;
  flex-direction: column;
  background: rgba(0,0,0,.85);
  position: absolute;
  top: 100;
  left: 10;
  z-index:100;
  border: 1px solid #5c96ac;
  border-top-color: transparent;
`;
const OptContainer = styled(TouchableHighlight)`
  height: 50;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const OptText = styled.Text`
  color: #5c96ac;
  text-align: center;
`;

// Props = {inviteToggle}
const DropDown = props => (
    <DropDownContainer>
        <OptContainer onPress={() => {
            props.toggleForm();
            props.dropDown();
        }} >
            <OptText>invite</OptText>
        </OptContainer>
        <OptContainer onPress={() => console.log("pressed")}>
            <OptText>users</OptText>
        </OptContainer>
        <OptContainer onPress={() => console.log("pressed")}>
            <OptText>wallpaper</OptText>
        </OptContainer>
        <OptContainer onPress={() => console.log("pressed")}>
            <OptText>media</OptText>
        </OptContainer>
    </DropDownContainer>
)

export default DropDown;
