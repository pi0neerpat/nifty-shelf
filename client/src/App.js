import React, { Component } from "react";
import "./App.css";
import {
  Grid,
  Message,
  Input,
  Form,
  Menu,
  Segment,
  Header,
  Divider,
  Icon,
  Button,
  Progress,
  Popup,
  Container,
  Modal,
  Table,
  Image,
  List,
  Search,
  Responsive,
  Visibility,
  Accordion,
  Card,
  Reveal,
  Sidebar,
  Dropdown,
} from "semantic-ui-react";

import Scanner from "./components/scanner";
import moment from "moment";
import _ from "lodash";
import PropTypes from "prop-types";
import { TwitterShareButton } from "react-share";

const axios = require("axios");

const twitter = require("./assets/twitter.png");
const user = require("./assets/user.png");
const ethereum = require("./assets/ethereum.png");
const github = require(`./assets/github.png`);
const question = require(`./assets/question.png`);
const exampleMobile = require(`./assets/exampleMobile.png`);
const basicShelf = require(`./assets/basicShelf.png`);
const basicShelfSmall = require(`./assets/basicShelfSmall.png`);
const shelfLogo = require(`./assets/shelfLogo.png`);
const unknownTrophy = require(`./assets/unknownTrophy.png`);

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      abi: { abi: "empty" },
      abiRaw: "",
      network: "",
      requiredNetwork: "",
      contractAddress: "",
      getnftData: "",
      errorMessage: false,
      loading: false,
      methodData: [],
      mnemonic: "",
      metaData: {},
      nftData: false,
      recentContracts: {},
      userSavedContracts: {},
      externalContracts: [],
      userHasBeenLoaded: false,
      activeIndex: [],
      activeItem: "write",
      // ENS
      ensSubnode: "myDapp2",
      ensFee: 0.01,
      existingSubnodes: [],
      //Search
      results: [],
      isLoading: false,
      // Display states
      currentDappFormStep: 0,
      displayDappForm: true, // Set to true to see landing page
      displayLoading: false,
      //new from dapparatus
      enableDapparatus: false,
      web3: false,
      account: false,
      gwei: 4,
      doingTransaction: false,
      customLoader: false,
    };
  }
  componentDidMount = async () => {
    if (!this.getNFT()) {
      // this.getRecentPublicContracts();
      // this.getExternalContracts();
      // this.getExistingSubnodes();
    }
  };
  getNFT = () => {
    let userAddress = window.location.pathname.substring(1, 43);
    if (userAddress.length > 1) {
      this.showLoading("downloading");
      this.setState({
        enableDapparatus: false,
        displayDappForm: false,
        userAddress,
      });

      axios
        .get(`https://api.opensea.io/api/v1/assets?owner=${userAddress}`)
        .then((result) => {
          // console.log(result);
          if (result.data.assets && result.data.assets.length < 1) {
            console.log(`Could not find any trophies for ${userAddress}`);
            this.showLoading("not found");
          } else {
            document.title = `Nifty Shelf: ${userAddress}`;
            console.log("Open Sea API data: ");
            console.log(result.data);
            let newData = result.data;
            newData.userAddress = userAddress;
            this.setState({
              displayLoading: false,
              nftData: newData,
            });
            // axios.get(`/shelf/${userAddress}`).then((result) => {
            //   newData.viewCount = result.data.viewCount;
            // });
          }
        })
        .catch((e) => {
          console.log(`Could not find any trophies for ${userAddress}`);
          this.showLoading("not found");
        });
      return true;
    } else {
      return false;
    }
  };
  handleChange = (e, { name, value }) => {
    this.setState({ [name]: value });
  };
  handleAddressChange = (e, { name, value }) => {
    this.setState({ [name]: value });
    setTimeout(() => {
      //maybe they just scanned an address?
      window.location = "/" + value;
    }, 100);
  };
  handleInput(e) {
    let update = {};
    update[e.target.name] = e.target.value;
    this.setState(update);
  }
  handleToggleAccordian = (e, titleProps) => {
    // Manages which premium feature is active
    const { index } = titleProps;
    const { activeIndex } = this.state;
    let newIndex = activeIndex;
    if (activeIndex && activeIndex.includes(index)) {
      newIndex.splice(activeIndex.indexOf(index), 1);
    } else newIndex.push(index);
    this.setState({ activeIndex: newIndex });
  };

  handleCreateNewDapp = () => {
    this.setState({
      currentDappFormStep: 1,
      enableDapparatus: true,
    });
    window.scrollTo(0, 0);
  };
  handleSubmitSuggestion = () => {
    axios
      .post(`/suggestion`, {
        suggestion: this.state.suggestion,
      })
      .then(
        this.setState({
          suggestionSubmitted: true,
        })
      )
      .catch((err) => {
        console.log(err);
      });
  };
  showErrorMessage = (type) => {
    let message = <div />;
    if (this.state.errorMessage) {
      if (type === "popup") {
        message = (
          <div
            style={{
              position: "fixed",
              zIndex: 10,
              top: 60,
              left: 60,
              paddingRight: 60,
              textAlign: "left",
            }}
          >
            <Message
              style={{ zIndex: 12 }}
              size="large"
              error
              onDismiss={() => this.setState({ errorMessage: false })}
              header="Error:"
              content={this.state.errorMessage}
            />
          </div>
        );
      } else {
        message = (
          <Message
            style={{ zIndex: 12 }}
            attached="top"
            error
            header="Oops!"
            content={this.state.errorMessage}
          />
        );
      }
    }
    return message;
  };
  showLoading = (action) => {
    let loading = false;
    if (action === "downloading") {
      loading = (
        <div className="loadingDIV">
          <Icon.Group size="huge">
            <Icon loading size="large" name="circle notch" />
            <Icon name="download" />
          </Icon.Group>
          <Header as="h2">Loading...</Header>
          <Image centered src={shelfLogo} size="large" />
        </div>
      );
    } else if (action === "not found") {
      loading = (
        <div className="dAppNotFound">
          <Container>
            <Grid stackable columns={2}>
              <Grid.Column>
                <Icon size="huge" name="ban" />
                <Header as="h2">
                  Sorry, we couldn't find any NFT trophies for this address.
                </Header>
                <br />
                <h2>
                  <a
                    href={`https://blockscout.com/eth/mainnet/address/${this.state.userAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {this.state.userAddress.substring(0, 6)}...
                    {this.state.userAddress.substring(38, 50)}
                  </a>
                </h2>
                <Button
                  onClick={() => {
                    window.location.replace(`/`);
                  }}
                  color="green"
                  size="huge"
                  icon="retweet"
                  content="Start over"
                />
              </Grid.Column>
              <Grid.Column>
                <Image centered src={shelfLogo} size="large" />
              </Grid.Column>
            </Grid>
          </Container>
        </div>
      );
    }
    this.setState({ displayLoading: loading });
  };
  renderDappForm() {
    const { currentDappFormStep } = this.state;
    const errorMessage = this.showErrorMessage();
    let formDisplay = [];

    if (currentDappFormStep < 1) {
      formDisplay = (
        <div>
          <Responsive minWidth={Responsive.onlyTablet.minWidth}>
            <div className="homePageHeader">
              <Grid
                container
                stackable
                columns={2}
                verticalAlign="middle"
                textAlign="center"
              >
                <Grid.Column textAlign="left">
                  <p style={{ fontSize: "4em" }}>
                    NFT trophies...
                    <br />
                    on a shelf
                  </p>
                </Grid.Column>
                <Grid.Column>
                  <Image src={shelfLogo} />
                </Grid.Column>
                <Divider hidden />
                <Grid.Row />
              </Grid>
              <Container>
                <p style={{ textAlign: "left", fontSize: "2em" }}>
                  Enter an ETH address:
                </p>
                <Grid columns={2} textAlign="left">
                  <Grid.Column width={8}>
                    <Form
                      error={!!this.state.errorMessage}
                      onSubmit={() =>
                        window.location.replace(`/${this.state.userAddress}`)
                      }
                    >
                      <Form.Input
                        size="huge"
                        placeholder="0xabc..."
                        name="userAddress"
                        onChange={this.handleAddressChange}
                        value={this.state.userAddress}
                      />
                    </Form>
                  </Grid.Column>
                  <Grid.Column>
                    <Modal
                      centered={false}
                      closeIcon
                      style={{
                        textAlign: "left",
                        paddingTop: "3rem",
                      }}
                      trigger={
                        <Button
                          style={{ textAlign: "left" }}
                          size="huge"
                          icon="camera"
                          content="Scan QR"
                          onClick={null}
                        />
                      }
                      basic
                    >
                      <Header Scan your address />
                      <Modal.Content>
                        <Scanner
                          changeView={this.changeView}
                          onError={(error) => {
                            this.changeAlert("danger", error);
                          }}
                        />
                      </Modal.Content>
                    </Modal>
                  </Grid.Column>
                </Grid>
                <Divider hidden />
                <h4 style={{ textAlign: "left" }}>
                  No nifties?{" "}
                  <a href="https://niftyshelf.com/0x0f48669b1681d41357eac232f516b77d0c10f0f1/">
                    See an example.
                  </a>
                </h4>
              </Container>
            </div>
          </Responsive>
          <Responsive maxWidth={Responsive.onlyMobile.maxWidth}>
            <div className="homePageHeaderMobile">
              <p style={{ fontSize: "3em" }}>
                NFT trophies...
                <br />
                on a shelf
              </p>
              <Image
                centered
                src={shelfLogo}
                style={{ paddingRight: "2rem", paddingLeft: "2rem" }}
              />
              <br />
              <br />
              <Container>
                <Form
                  error={!!this.state.errorMessage}
                  onSubmit={() =>
                    window.location.replace(`/${this.state.userAddress}`)
                  }
                >
                  <Form.Input
                    size="huge"
                    placeholder="0xabc..."
                    label="Enter an ETH address"
                    fluid
                    name="userAddress"
                    onChange={this.handleAddressChange}
                    value={this.state.userAddress}
                  />
                </Form>
                <Divider hidden horizontal />
                <Modal
                  centered={false}
                  closeIcon
                  style={{
                    paddingTop: "3rem",
                  }}
                  trigger={
                    <Button fluid size="huge" icon="camera" content="Scan QR" />
                  }
                  basic
                >
                  <Header Scan your address />
                  <Modal.Content>
                    <Scanner
                      changeView={this.changeView}
                      onError={(error) => {
                        this.changeAlert("danger", error);
                      }}
                    />
                  </Modal.Content>
                </Modal>
                <h4 style={{ textAlign: "left" }}>
                  No nifties?{" "}
                  <a href="https://niftyshelf.com/0x0f48669b1681d41357eac232f516b77d0c10f0f1/">
                    See an example.
                  </a>
                </h4>
              </Container>
            </div>
          </Responsive>
          <div className="homePageContentWhite">
            <Grid container stackable columns={2}>
              <Grid.Row textAlign="left" verticalAlign="middle">
                <Grid.Column>
                  <h1>Do you build dApps?</h1>
                  <h3>
                    Check out our other free tool. Make a dApp in seconds,
                    without writing any code{" "}
                    <a href="https://OneClickdApp.com" target="blank">
                      OneClickdApp.com
                    </a>
                  </h3>
                </Grid.Column>
                <Grid.Column>
                  <Image src={exampleMobile} size="large" />
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </div>
        </div>
      );
    }
    return <div>{formDisplay}</div>;
  }
  renderFooter() {
    return (
      <div className="footer">
        <Grid divided stackable textAlign="left">
          <Grid.Column width={3}>
            <h4>Nifty Shelf</h4>
            <List link>
              <List.Item
                style={{ color: "white" }}
                as="a"
                href="https://opensea.io"
                target="blank"
              >
                Data by OpenSea.io
              </List.Item>
              <List.Item
                style={{ color: "white" }}
                as="a"
                href="mailto:blockchainbuddha@gmail.com?subject=Question%20about%20NiftyShelf.com"
                target="_self"
              >
                Contact Us
              </List.Item>
            </List>
          </Grid.Column>
          <Grid.Column width={3}>
            <h4>Other cool stuff</h4>
            <List link>
              <List.Item
                style={{ color: "white" }}
                as="a"
                href="https://oneclickdapp.com"
                target="blank"
              >
                One Click dApp
              </List.Item>
              <List.Item
                style={{ color: "white" }}
                as="a"
                href="https://xdai.io"
                target="blank"
              >
                Burner Wallet
              </List.Item>
            </List>
          </Grid.Column>
          <Grid.Column width={10}>
            <Grid stackable columns={2}>
              <Grid.Column textAlign="left">
                <h4>Feedback</h4>
                What does this app need? What is broken?
              </Grid.Column>
              <Grid.Column textAlign="left">
                <Form
                  error={!!this.state.errorMessage}
                  onSubmit={this.handleSubmitSuggestion}
                  success={this.state.suggestionSubmitted}
                >
                  <Form.TextArea
                    placeholder="You guys rock!"
                    required
                    name="suggestion"
                    onChange={this.handleChange}
                    value={this.state.suggestion}
                  />
                  <Form.Button icon="share" content="Send" />
                  <Message success header="Thank you!" />
                </Form>
              </Grid.Column>
            </Grid>
          </Grid.Column>
          Your ERC-721 tokens on a shelf. Copyright 2019 NiftyShelf.com
        </Grid>
      </div>
    );
  }
  renderInterface() {
    const { nftData, activeIndex } = this.state;
    const errorMessage = this.showErrorMessage("popup");
    let trophies = this.renderTrophies();

    return (
      <div
        style={{
          paddingTop: "3em",
          paddingBottom: "5em",
        }}
      >
        <Grid stackable container columns={4} textAlign="center">
          {trophies}
        </Grid>
        {errorMessage}
      </div>
    );
  }
  renderTrophies() {
    const { nftData } = this.state;
    let displayTrophies = [];
    let lastShelfIndex = 0;
    if (nftData.assets) {
      nftData.assets.forEach((trophy, index) => {
        let displayLastSale = [];
        if (trophy.last_sale && trophy.last_sale.seller) {
          displayLastSale = (
            <Table.Row textAlign="center">
              <Table.Cell>
                <Icon name="legal" size="large" />
              </Table.Cell>
              <Table.Cell textAlign="left">
                Bought for {trophy.last_sale.payment_token.symbol} from{" "}
                {(
                  <a
                    href={`https://blockscout.com/eth/mainnet/address/${trophy.last_sale.seller.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {trophy.last_sale.seller.address.substring(0, 6)}...
                    {trophy.last_sale.seller.address.substring(38, 50)}
                  </a>
                ) || "unknown"}
              </Table.Cell>
            </Table.Row>
          );
        }
        if (index - lastShelfIndex > 3) {
          lastShelfIndex = index;
          displayTrophies.push(
            <Responsive minWidth={Responsive.onlyTablet.minWidth}>
              <Grid.Row>
                <Image centered src={basicShelf} />
              </Grid.Row>
            </Responsive>
          );
        }
        let displayExternalLink = (
          <Table.Row>
            <Table.Cell textAlign="center">
              <Icon name="linkify" />
            </Table.Cell>
            <Table.Cell>
              {trophy.asset_contract.name} #{trophy.token_id}
              <br />
              (No link provided)
            </Table.Cell>
          </Table.Row>
        );
        let tokenID = trophy.token_id;
        if (tokenID.length > 5) {
          tokenID = `${tokenID.substring(0, 5)}...`;
        }
        if (trophy.external_link) {
          displayExternalLink = (
            <Table.Row>
              <Table.Cell textAlign="center">
                <Image size="mini" src={trophy.asset_contract.image_url} />
              </Table.Cell>
              <Table.Cell>
                <a href={trophy.external_link} target="_blank" rel="noopener">
                  {trophy.asset_contract.name} #{tokenID}
                </a>
              </Table.Cell>
            </Table.Row>
          );
        }
        let trophyImage = unknownTrophy;
        if (trophy.asset_contract.image_url) {
          trophyImage = trophy.asset_contract.image_url;
        }
        if (trophy.image_url) {
          trophyImage = trophy.image_url;
        }
        let trophyName =
          trophy.name ||
          trophy.asset_contract.name + " #" + trophy.token_id ||
          "unknown";
        if (trophy.asset_contract.name === "" && trophy.name === null) {
          trophyName = "unknown #" + trophy.token_id;
        }
        displayTrophies.push(
          <Accordion
            as={Grid.Column}
            verticalAlign="bottom"
            key={index}
            style={{
              textAlign: "center",
              height: "100%",
              paddingBottom: "7rem",
              zIndex: 100 - index,
            }}
          >
            <Modal
              centered={false}
              closeIcon
              style={{
                paddingTop: "3rem",
              }}
              trigger={
                <Image
                  src={trophyImage}
                  centered
                  as={Card}
                  link
                  style={{
                    height: "100%",
                    background: "#c2cafc",
                  }}
                />
              }
              basic
            >
              <Header
                content={
                  trophy.name || "unknown " + trophy.token_id || "(unknown)"
                }
              />
              <Modal.Content>
                <Image src={trophyImage} centered />
              </Modal.Content>
            </Modal>

            <Card
              link
              raised
              centered
              style={{
                position: "absolute",
                left: "50%",
                marginLeft: "-140px",
                width: "280px",
              }}
            >
              <Card.Content>
                <Accordion.Title
                  active={this.state.activeIndex.includes(index)}
                  index={index}
                  onClick={this.handleToggleAccordian}
                >
                  <Header
                    style={{
                      wordWrap: "break-word",
                      textAlign: "center",
                    }}
                  >
                    {trophyName}
                  </Header>
                </Accordion.Title>
                <Accordion.Content
                  active={this.state.activeIndex.includes(index)}
                >
                  <Container>
                    <Table basic unstackable definition>
                      <Table.Body>
                        <Table.Row>
                          <Table.Cell textAlign="center">
                            <Icon name="comment" size="large" />
                          </Table.Cell>
                          <Table.Cell>{trophy.description}</Table.Cell>
                        </Table.Row>
                        {displayExternalLink}
                        <Table.Row>
                          <Table.Cell textAlign="center">
                            <Icon name="at" size="large" />
                          </Table.Cell>
                          <Table.Cell>
                            <a
                              href={`https://blockscout.com/eth/mainnet/address/${trophy.asset_contract.address}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {trophy.asset_contract.address.substring(0, 6)}
                              ...
                              {trophy.asset_contract.address.substring(38, 50)}
                            </a>
                          </Table.Cell>
                        </Table.Row>
                        {displayLastSale}
                      </Table.Body>
                    </Table>
                  </Container>
                </Accordion.Content>
              </Card.Content>
            </Card>
          </Accordion>
        );
        displayTrophies.push(
          <Responsive maxWidth={Responsive.onlyTablet.minWidth}>
            <Grid.Row>
              <Image
                centered
                src={basicShelfSmall}
                style={{ paddingTop: "6rem" }}
              />
            </Grid.Row>
          </Responsive>
        );
        if (index === nftData.assets.length - 1) {
          displayTrophies.push(
            <Responsive minWidth={Responsive.onlyTablet.minWidth}>
              <Grid.Row>
                <Image centered src={basicShelf} />
              </Grid.Row>
            </Responsive>
          );
        }
      });
    }
    return displayTrophies;
  }
  render() {
    let {
      account,
      gwei,
      block,
      avgBlockTime,
      etherscan,

      displayDappForm,
      displayLoading,
      enableDapparatus,
    } = this.state;
    let connectedDisplay = [];
    let mainDisplay = [];
    if (displayLoading) {
      mainDisplay = displayLoading;
    } else if (displayDappForm) {
      mainDisplay = this.renderDappForm();
    } else {
      mainDisplay = this.renderInterface();
    }
    return (
      <div className="App">
        <div className="content">
          <ResponsiveContainer
            className="ResponsiveContainer"
            nftData={this.state.nftData}
          >
            {mainDisplay}
            {connectedDisplay}
          </ResponsiveContainer>
        </div>
        {this.renderFooter()}
      </div>
    );
  }
}

export default App;

// Mobile Responsive components
const ResponsiveContainer = ({ children, nftData }) => (
  <div>
    <DesktopContainer nftData={nftData}>{children}</DesktopContainer>
    <MobileContainer nftData={nftData}>{children}</MobileContainer>
  </div>
);

class DesktopContainer extends Component {
  state = {};

  hideFixedMenu = () => this.setState({ fixed: false });
  showFixedMenu = () => this.setState({ fixed: true });

  render() {
    const { children, nftData } = this.props;
    let backgroundColor = null;
    if (nftData.premium) {
      backgroundColor = nftData.colorLight;
    }

    return (
      <Responsive minWidth={Responsive.onlyTablet.minWidth}>
        <Visibility
          once={false}
          onBottomPassed={this.showFixedMenu}
          onBottomPassedReverse={this.hideFixedMenu}
        >
          <Menu borderless size="huge">
            <Menu.Menu className="topMenu" style={{ backgroundColor }}>
              <Menu.Item as="a" href="https://niftyshelf.com">
                Nifty Shelf
              </Menu.Item>

              <Menu.Item>
                <Dropdown simple text="About">
                  <Dropdown.Menu>
                    <Dropdown.Item
                      target="_blank"
                      rel="noopener noreferrer"
                      href="https://github.com/blockchainbuddha/nifty-shelf"
                      image={github}
                      text="Github"
                    />
                    <Dropdown.Item
                      image={twitter}
                      href="https://twitter.com/pi0neerpat"
                      target="_blank"
                      rel="noopener noreferrer"
                      text="Developer twitter"
                    />
                  </Dropdown.Menu>
                </Dropdown>
              </Menu.Item>
            </Menu.Menu>
          </Menu>
          <Heading nftData={nftData} />
        </Visibility>
        {children}
      </Responsive>
    );
  }
}

class MobileContainer extends Component {
  state = {};

  handlePusherClick = () => {
    const { sidebarOpened } = this.state;

    if (sidebarOpened) this.setState({ sidebarOpened: false });
  };

  handleToggle = () =>
    this.setState({ sidebarOpened: !this.state.sidebarOpened });

  render() {
    const { children, nftData } = this.props;
    const { sidebarOpened } = this.state;
    let backgroundColor = null;
    if (nftData.premium) {
      backgroundColor = nftData.colorLight;
    }
    return (
      <Responsive maxWidth={Responsive.onlyMobile.maxWidth}>
        <Sidebar.Pushable>
          <Sidebar
            as={Menu}
            animation="uncover"
            vertical
            inverted
            pointing
            borderless
            visible={sidebarOpened}
          >
            <Menu.Item as="a" href="https://niftyshelf.com">
              Nifty Shelf
            </Menu.Item>
            <Menu.Item
              as="a"
              image={twitter}
              href="https://twitter.com/pi0neerpat"
              target="_blank"
              rel="noopener noreferrer"
            >
              Developer Twitter
            </Menu.Item>
            <Menu.Item
              as="a"
              target="_blank"
              rel="noopener noreferrer"
              href="https://github.com/blockchainbuddha/nifty-shelf"
              image={github}
            >
              Github
            </Menu.Item>
          </Sidebar>
          <Sidebar.Pusher
            dimmed={sidebarOpened}
            onClick={this.handlePusherClick}
            style={{ minHeight: "100vh" }}
          >
            <Menu borderless size="large">
              <Menu.Menu className="topMenu" style={{ backgroundColor }}>
                <Menu.Item onClick={this.handleToggle}>
                  <Icon name="sidebar" />
                </Menu.Item>
              </Menu.Menu>
            </Menu>
            <Heading mobile nftData={nftData} />
            {children}
          </Sidebar.Pusher>
        </Sidebar.Pushable>
      </Responsive>
    );
  }
}

// Handles favicon, background, and header for premium dApp
const Heading = ({ mobile, nftData }) => {
  var link =
    document.querySelector("link[rel*='icon']") ||
    document.createElement("link");
  link.type = "image/x-icon";
  link.rel = "shortcut icon";
  link.href = nftData.favicon;
  document.getElementsByTagName("head")[0].appendChild(link);
  document.body.style.background = "#c2cafc";
  // document.body.style.backgroundAttachment = 'fixed';

  if (nftData.assets && nftData.assets.length > 0) {
    const etherscan = ""; //translateEtherscan(nftData.network[0]);
    const displayRegistryData = getRegistryData(
      nftData.metaData,
      nftData.network
    );
    let displayTitle = (
      <Header as="h1" style={{ wordWrap: "break-word" }}>
        {nftData.userAddress}
      </Header>
    );
    if (nftData.assets[0].owner.user && nftData.assets[0].owner.user.username) {
      displayTitle = (
        <Header as="h1" style={{ wordWrap: "break-word" }}>
          {nftData.assets[0].owner.user.username}'s Trophies{" "}
        </Header>
      );
    }
    return (
      <div className="defaultHeader">
        <Grid
          stackable
          columns={2}
          style={{
            paddingTop: mobile ? "1em" : "2em",
          }}
        >
          <Grid.Row textAlign="center" verticalAlign="middle">
            <Grid.Column>
              {displayTitle}
              <Container>
                <TwitterShareButton
                  title={`Check out my cool Nifty trophies! niftyshelf.com/${nftData.userAddress}`}
                  url={`niftyshelf.com/${nftData.userAddress}`}
                  hashtags={["NFT", "ERC721", "NiftyShelf"]}
                >
                  <Button secondary>
                    <Image inline src={twitter} size="mini" /> Make 'em jealous
                  </Button>
                </TwitterShareButton>
              </Container>
            </Grid.Column>
            <Grid.Column>
              <Table basic unstackable definition>
                <Table.Body>
                  <Table.Row>
                    <Table.Cell textAlign="center">
                      <Image src={user} size="mini" centered />
                    </Table.Cell>
                    <Table.Cell>
                      <a
                        href={`https://blockscout.com/eth/mainnet/address/${nftData.userAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {nftData.userAddress.substring(0, 6)}...
                        {nftData.userAddress.substring(38, 50)}
                      </a>
                    </Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell textAlign="center">
                      <Icon name="bookmark" size="large" />
                    </Table.Cell>
                    <Table.Cell>
                      <b>
                        <a
                          href={`niftyshelf.com/${nftData.userAddress}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          niftyshelf.com/{nftData.userAddress.substring(0, 6)}
                          ...
                          {nftData.userAddress.substring(38, 50)}
                        </a>
                      </b>
                    </Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell textAlign="center">
                      <Icon name="eye" size="large" />
                    </Table.Cell>
                    <Table.Cell>{nftData.viewCount} views</Table.Cell>
                  </Table.Row>
                </Table.Body>
              </Table>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    );
  } else {
    return null;
  }
};

ResponsiveContainer.propTypes = {
  children: PropTypes.node,
};
DesktopContainer.propTypes = {
  children: PropTypes.node,
};
MobileContainer.propTypes = {
  children: PropTypes.node,
};
Heading.propTypes = {
  mobile: PropTypes.bool,
};

function translateEtherscan(network) {
  let etherscan = "https://etherscan.io/";
  if (network) {
    if (network === "Unknown" || network === "private") {
      etherscan = "http://localhost:8000/#/";
    } else if (network === "POA") {
      etherscan = "https://blockscout.com/poa/core/";
    } else if (network === "xDai") {
      etherscan = "https://blockscout.com/poa/dai/";
    } else if (network !== "Mainnet") {
      etherscan = "https://" + network + ".etherscan.io/";
    }
  }
  return etherscan;
}

function getRegistryData(metaData, network) {
  let registryData = "(available only on mainnet)";
  if (metaData && metaData.data) {
    registryData = (
      <div>
        <Popup
          hoverable
          keepInViewPort
          position="bottom left"
          trigger={
            <Segment
              compact
              size="tiny"
              onClick={() => {
                window.open(metaData.data.metadata.url, "_blank");
              }}
            >
              <Image inline size="mini" src={metaData.data.metadata.logo} />
              {metaData.name}
            </Segment>
          }
        >
          <Table definition unstackable collapsing>
            <Table.Body>
              <Table.Row>
                <Table.Cell>Description</Table.Cell>
                <Table.Cell>{metaData.data.metadata.description}</Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>Verified</Table.Cell>
                <Table.Cell>
                  {JSON.stringify(metaData.data.metadata.reputation.verified)}
                </Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>Status</Table.Cell>
                <Table.Cell>
                  {metaData.data.metadata.reputation.status}
                </Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>Category</Table.Cell>
                <Table.Cell>
                  {metaData.data.metadata.reputation.category}
                </Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>Self attested</Table.Cell>
                <Table.Cell>{metaData.self_attested.toString()}</Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>Curated</Table.Cell>
                <Table.Cell>{metaData.curated.toString()}</Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>Scam info</Table.Cell>
                <Table.Cell>{JSON.stringify(metaData.data.scamdb)}</Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table>
          Metadata powered by{" "}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://ethregistry.org/"
          >
            Eth Registry
          </a>
        </Popup>
      </div>
    );
  } else if (network === "Mainnet") {
    registryData = (
      <div>
        Metadata: Nothing found. Add it to{" "}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="http://www.oneclickdapp.com/resume-reflex/"
        >
          EthRegistry
        </a>
      </div>
    );
  }
  return registryData;
}
