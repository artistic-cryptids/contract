import * as React from 'react';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Accordion from 'react-bootstrap/Accordion';
import { FormControlProps } from 'react-bootstrap/FormControl';
import ipfs from '../ipfs';

interface RegisterProps {
  drizzle: any;
  drizzleState: any;
}

interface RegisterFormFields {
  title: string;
  artistName: string;
  artistNationality: string;
  artistBirthYear: string;
  artifactCreationDate: string;
  medium: string;
  edition: string;
  imageIpfsHash: string;
  size: string;
  metaIpfsHash: string;
}

interface RegisterState {
  fields: RegisterFormFields;
  registerTransactionStackId: any;
  validated: boolean;
}

type InputChangeEvent = React.FormEvent<FormControlProps> &
  {
    target: {
      id: keyof RegisterFormFields;
      value: RegisterFormFields[keyof RegisterFormFields];
    };
  }

const GENERIC_FEEDBACK = <Form.Control.Feedback>Looks good!</Form.Control.Feedback>;

class Register extends React.Component<RegisterProps, RegisterState> {
  constructor (props: RegisterProps) {
    super(props);
    this.state = {
      registerTransactionStackId: null,
      validated: false,
      fields: {
        title: '',
        artistName: '',
        artistNationality: '',
        artistBirthYear: '',
        edition: '',
        artifactCreationDate: '',
        medium: '',
        size: '',
        imageIpfsHash: '',
        metaIpfsHash: '',
      },
    };
  }

  registerArtifact = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.stopPropagation();
    event.preventDefault();

    const form = event.currentTarget;
    if (!form.checkValidity()) {
      return;
    }

    this.setState({ validated: true });

    const { drizzle, drizzleState } = this.props;

    const currentAccount = drizzleState.accounts[0];
    const artist = drizzleState.accounts[0]; // TODO: Update this to real artist's account

    const jsonData = {
      'title': this.state.fields.title,
      'artistName': this.state.fields.artistName,
      'artistNationality': this.state.fields.artistNationality,
      'artistBirthYear': this.state.fields.artistBirthYear,
      'edition': this.state.fields.edition,
      'createdDate': this.state.fields.artifactCreationDate,
      'medium': this.state.fields.medium,
      'size': this.state.fields.size,
      'imageIpfsHash': this.state.fields.imageIpfsHash,
    };

    const jsonDataBuffer = Buffer.from(JSON.stringify(jsonData));
    const files = Array(jsonDataBuffer);

    // TODO: this upload takes like 5 seconds. Some kind of loading notification should display
    await this.saveMetaToIpfs(files);

    const fields = this.state.fields;
    console.log(fields);
    const stackId = drizzle.contracts.ArtifactApplication.methods.applyFor.cacheSend(
      currentAccount,
      artist,
      'https://ipfs.io/ipfs/' + this.state.fields.metaIpfsHash,
      {
        from: drizzleState.accounts[0],
        gasLimit: 6000000,
      },
    ); // TODO: Catch error when this function fails and display error to user
    console.log(stackId);

    this.setState({
      registerTransactionStackId: stackId,
    });
  };

  getRegisterTransactionStatus = (): string | null => {
    const { transactions, transactionStack } = this.props.drizzleState;

    const registerTransactionHash = transactionStack[this.state.registerTransactionStackId];
    if (!registerTransactionHash) {
      return null;
    }

    if (!transactions[registerTransactionHash]) {
      return null;
    }

    if (transactions[registerTransactionHash].status === 'success') {
      return 'Successfully registered artwork for approval';
    } else {
      return 'Error occured while registering artwork for approval';
    }
  };

  async saveImgToIpfs (files: any): Promise<void> {
    let ipfsId: string;
    await ipfs.add([...files], { progress: (prog: any) => console.log(`received: ${prog}`) })
      .then((response: any) => {
        ipfsId = response[0].hash;
        this.setState({ fields: { ...this.state.fields, imageIpfsHash: ipfsId } });
      }).catch((err: any) => {
        console.log(err);
      });
  }

  async saveMetaToIpfs (files: any): Promise<void> {
    let ipfsId: string;
    await ipfs.add([...files], { progress: (prog: any) => console.log(`received: ${prog}`) })
      .then((response: any) => {
        ipfsId = response[0].hash;
        this.setState({ fields: { ...this.state.fields, metaIpfsHash: ipfsId } });
      }).catch((err: any) => {
        console.log(err);
      });
  }

  // This needs to be an arrow constructor to bind `this`, which is bonkers.
  inputChangeHandler = (event: InputChangeEvent): void => {
    const key = event.target.id;
    const val = event.target.value;
    const stateUpdate = { fields: this.state.fields as Pick<RegisterFormFields, keyof RegisterFormFields> };
    stateUpdate.fields[key] = val;
    this.setState(stateUpdate);
  };

  renderArtifactInformation = (): React.ReactNode => {
    return (
      <Container>
        <Form.Row>
          <Form.Group as={Col} controlId="title">
            <Form.Label>Title</Form.Label>
            <Form.Control
              required
              type="text"
              onChange={this.inputChangeHandler}/>
            {GENERIC_FEEDBACK}
          </Form.Group>
        </Form.Row>

        <Form.Row>
          <Form.Group as={Col} controlId="artifactCreationDate">
            <Form.Label>Date of creation</Form.Label>
            <Form.Control
              required
              type="text"
              onChange={this.inputChangeHandler}/>
            {GENERIC_FEEDBACK}
          </Form.Group>
        </Form.Row>

        <Form.Row>
          <Form.Group as={Col} controlId="medium">
            <Form.Label>Medium of Artwork</Form.Label>
            <Form.Control
              required
              type="text"
              onChange={this.inputChangeHandler}/>
            {GENERIC_FEEDBACK}
          </Form.Group>

          <Form.Group as={Col} controlId="size">
            <Form.Label>Size of Creation</Form.Label>
            <Form.Control
              required
              type="text"
              onChange={this.inputChangeHandler}/>
            {GENERIC_FEEDBACK}
          </Form.Group>
        </Form.Row>
      </Container>
    );
  };

  renderArtistInformation = (): React.ReactNode => {
    return (
      <Container>
        <Form.Row>
          <Form.Group as={Col} controlId="artistName">
            <Form.Label>Artist Name</Form.Label>
            <Form.Control
              required
              type="text"
              onChange={this.inputChangeHandler}/>
            {GENERIC_FEEDBACK}
          </Form.Group>
        </Form.Row>
        <Form.Row>
          <Form.Group as={Col} controlId="artistNationality">
            <Form.Label>Artist Nationality</Form.Label>
            <Form.Control
              required
              type="text"
              onChange={this.inputChangeHandler}/>
            {GENERIC_FEEDBACK}
          </Form.Group>
          <Form.Group as={Col} controlId="artistBirthYear">
            <Form.Label>Artist Birth Year</Form.Label>
            <Form.Control
              required
              type="text"
              onChange={this.inputChangeHandler}/>
            {GENERIC_FEEDBACK}
          </Form.Group>
        </Form.Row>
      </Container>
    );
  };

  // TODO: Split these into more manageable components
  // TODO: Make required fields actually required
  render (): React.ReactNode {
    let imgDisplay;
    if (this.state.fields.imageIpfsHash === '') {
      imgDisplay = (<h5>No image given.</h5>);
    } else {
      imgDisplay = (<Card.Img src={'https://ipfs.io/ipfs/' + this.state.fields.imageIpfsHash}/>);
    }
    return (
      <Container>
        <h5>
          Register a Piece
        </h5>
        <hr/>
        <Row>
          <Col sm={4}>
            <Card>
              {imgDisplay}
              <Card.Body>
                <div style={{
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'inline-block',
                }}>
                  <input
                    className="btn"
                    accept="image/*"
                    id="image-upload-button"
                    multiple
                    type="file"
                    style={{
                      position: 'absolute',
                      top: '0',
                      left: '0',
                      opacity: '0',
                    }}
                    onChange={(e): void => {
                      e.stopPropagation();
                      e.preventDefault();
                      const files = e.target.files;
                      if (files != null && files[0].size < 1000000) {
                        // max file size of one megabyte
                        this.saveImgToIpfs(files);
                      } else {
                        // TODO: nicer way of alerting
                        alert('Image cannot be greater than 1 MB!');
                      }
                    }}
                  />
                  <Button>
                    Upload Image
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col sm={8}>
            <Form
              noValidate
              validated={this.state.validated}
              onSubmit={this.registerArtifact}
            >
              <Accordion defaultActiveKey="0">
                <Card>
                  <Accordion.Toggle as={Card.Header} eventKey="0">
                    Artifact Information
                  </Accordion.Toggle>
                  <Accordion.Collapse eventKey="0">
                    <Card.Body>
                      {this.renderArtifactInformation()}
                    </Card.Body>
                  </Accordion.Collapse>
                </Card>
                <Card>
                  <Accordion.Toggle as={Card.Header} eventKey="1">
                    Artist Information
                  </Accordion.Toggle>
                  <Accordion.Collapse eventKey="1">
                    <Card.Body>
                      {this.renderArtistInformation()}
                    </Card.Body>
                  </Accordion.Collapse>
                </Card>
              </Accordion>
              <Button type="submit" className="my-2">
                Register
              </Button>
            </Form>
          </Col>
        </Row>
        <p className='lead'>{this.getRegisterTransactionStatus()}</p>
      </Container>
    );
  }
}

export default Register;
