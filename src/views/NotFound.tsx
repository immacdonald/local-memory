import { Button, Column, Page, Row, Section } from '@imacdonald/phantom';
import Text from 'components/Text';

const NotFound = () => {
    return (
        <Page title="Local Memory Project">
            <Section variant="floating">
                <Column>
                    <h2>Not Found</h2>
                </Column>
                <Text size="lg" align="center">
                    Unfortunately, the page you entered cannot be found.
                </Text>
                <br />
                <br />
                <Row>
                    <Button context="primary" label="Return Home" link="/" visual="filled" />
                </Row>
            </Section>
        </Page>
    );
};

export default NotFound;
