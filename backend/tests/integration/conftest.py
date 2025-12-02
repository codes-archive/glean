import pytest_asyncio
from sqlalchemy.ext.asyncio import AsyncSession


@pytest_asyncio.fixture
async def test_subscription(db_session: AsyncSession, test_user, test_feed):
    """Create a test subscription."""
    from glean_database.models.subscription import Subscription

    subscription = Subscription(user_id=test_user.id, feed_id=test_feed.id)
    db_session.add(subscription)
    await db_session.commit()
    await db_session.refresh(subscription)
    return subscription


@pytest_asyncio.fixture
async def test_feed(db_session: AsyncSession):
    """Create a test feed."""
    from glean_database.models.feed import Feed

    feed = Feed(
        url="https://example.com/feed.xml",
        title="Test Feed",
        description="A test RSS feed",
        status="active",
    )
    db_session.add(feed)
    await db_session.commit()
    await db_session.refresh(feed)
    return feed
