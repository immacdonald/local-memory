import { Heading, Page, Section, Typography } from 'phantom-library';
import { FC } from 'react';
import { Link } from 'react-router-dom';

const About: FC = () => {
    return (
        <Page title="About | Local Memory Project">
            <Section variant="inset" hasBackground>
                <Heading align="center">About</Heading>
                <Typography.Paragraph>
                    Local media is vital for a healthy democracy, but sadly in <Link to='https://localnewsinitiative.northwestern.edu/projects/state-of-local-news/'>decline</Link>. The Local Memory Project (LMP) is a service designed to help users discover local media in various US communities.
                </Typography.Paragraph>
                <Typography.Paragraph>
                    Our US local news media dataset currently has about <Link to='https://github.com/wm-newslab/3DLNews'>14,086 local media sources</Link>:
                    <ul>
                        <li>9,441 Newspapers</li>
                        <li>2,449 Radio</li>
                        <li>886 TV</li>
                        <li>1,310 Broadcast (TV or Radio)</li>
                    </ul>
                </Typography.Paragraph>
                <Typography.Paragraph>
                    The original idea of LMP was conceived by Adam Ziegler and Anastasia Aizman at the <Link to='https://lil.law.harvard.edu'>Harvard Library Innovation Lab</Link> in <Link to='https://web.archive.org/web/20160811070543/http://lil.law.harvard.edu:80/about'>2016</Link>, and was first <Link to='https://web.archive.org/web/20181118093140/http://localmemory.org/'>implemented</Link> by <Link to='https://ws-dl.blogspot.com/2016/11/2016-11-16-introducing-local-memory.html'>Alexander C. Nwala</Link>.
                </Typography.Paragraph>

                <Heading minor>Publications</Heading>
                <Typography.Text>3DLNews: A Three-decade Dataset of US Local News Articles</Typography.Text>
                <Typography.Text newline>Gangani Ariyarathne and Alexander C. Nwala</Typography.Text>
                <Typography.Text newline><Link to='https://arxiv.org/abs/2408.04716'>CIKM</Link></Typography.Text>
                <br/>

                <Heading minor>About Us</Heading>
                <Typography.Paragraph>
                    Local Memory Project is a project of the News Web and Social Media (NEWS) research lab at <Link to='https://www.wm.edu/'>William & Mary</Link>. NEWS Lab studies the web as an entity with a focus on (local) news and vectors of disinformation on social media. This service was developed by <Link to='https://ian-macdonald.com'>Ian MacDonald</Link> and <Link to='https://alexandernwala.com/'>Alexander C. Nwala</Link> (acnwala [at] wm.edu).
                </Typography.Paragraph>
            </Section>
        </Page>
    );
};

export { About };
